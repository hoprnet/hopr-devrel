/* Staking Season 5 */ 

/* Accounts and there staking amounts */
WITH current_stake AS (
    SELECT account, sum(actualAmount)/1e18 AS actual_stake 
    FROM (
            SELECT account, actualAmount FROM hopr_protocol_gnosis.HoprStakeSeason5_evt_Staked -- stores staking{{unnamed_parameter}} info 
            UNION All -- Computes the intersection of accounts  once tokens are allowed to be released 
            SELECT account, -actualAmount AS actualAmount FROM hopr_protocol_gnosis.HoprStakeSeason5_evt_Released
    ) AS t -- t is just a placeholder 
    GROUP BY t.account -- combines the duplicate accounts into one 
    HAVING sum(actualAmount)/1e18 > 0), -- Remove accounts who did not stake, but tried to use NFT boosts anyways.

/* Associate token ID's with boost types */ 
boost_nft AS ( -- Boost types (i.e. hodler nft is a type and indexed by a numerical value)
    SELECT boostTypeIndex AS boost_type, boostNumerator AS boost_numerator, redeemDeadline AS redeem_deadline, tokenId AS token_id 
    FROM hopr_protocol_gnosis.HoprBoost_evt_BoostMinted AS boost  -- maps NFT boost type and factor with events 
    LEFT JOIN hopr_protocol_gnosis.HoprBoost_evt_Transfer AS mint -- maps NFT transfers between accounts and tokden ID with events 
    ON boost.evt_tx_hash = mint.evt_tx_hash), -- Distinct events come from the fact that NFT's can be minted in batches (50 max per unique transaction)

/* Redeemed and Registered Boosts. All the transferred boosts are saved in an array */
redeemed AS (
    SELECT * FROM (
        SELECT *, row_number() OVER (PARTITION BY account, boost_type ORDER BY boost_numerator DESC, factorRegistered DESC) AS pos, 
        array_agg(token_id) OVER (PARTITION BY account ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING) AS transferred_nft_ids, -- map all token id's associate with an account into an array 
        array_agg(boost_type) OVER (PARTITION BY account ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING) AS transferred_nft_types -- same with bost 
        FROM hopr_protocol_gnosis.HoprStakeSeason5_evt_Redeemed AS redeemed -- info about account and tokden ID 
        LEFT JOIN boost_nft -- Join boost NFT table by token ID 
        ON redeemed.boostTokenId = boost_nft.token_id
    ) AS t
     -- take rank 1 of the redeemed boosts by its order and a valid registration
    WHERE factorRegistered = true AND pos = 1),

/* Link accounts to sync rewards */ 
synced AS (
    SELECT account, max(evt_block_time) AS last_sync_time, sum(increment)/1e18 AS last_sync_reward -- increment: when somebody does an action 
    FROM hopr_protocol_gnosis.HoprStakeSeason5_evt_Sync
    GROUP BY account),
    
 /* Link sync accounts with current stake */ 
sync_stake AS (
    SELECT synced.account, last_sync_time, now() AS now_utc, 
        unix_timestamp(to_utc_timestamp(last_sync_time, 'UTC')) AS last_sync_time_epoch,
        unix_timestamp(to_utc_timestamp(now(), 'UTC')) AS now_epoch,
        1666785600 AS basic_start, -- define start 
        1674738000 AS program_end, -- define program end 
        last_sync_reward, 
        coalesce(actual_stake, 0) AS actual_stake,
        793 AS actual_base -- define base (APR of 10%)
    FROM synced
    LEFT JOIN current_stake
    ON synced.account = current_stake.account), -- join information based on account info 

/* Merge Sync Stake and reedeemed */
sync_stake_redeemed AS (
    SELECT sync_stake.account, last_sync_time, now_utc, last_sync_time_epoch, now_epoch, 
        last_redeem_time, coalesce(unix_timestamp(to_utc_timestamp(last_redeem_time, 'UTC')), 0) AS last_redeem_time_epoch, 
        basic_start, program_end, 
        actual_stake, actual_base,
        last_sync_reward, coalesce(total_boost, 0) AS total_boost -- COALESCE() returns the first non Null value in a list
    FROM sync_stake 
    /* Merge redeemed boosts */
    LEFT JOIN (
        SELECT account, max(evt_block_time) AS last_redeem_time, sum(boost_numerator) AS total_boost 
        FROM redeemed
        GROUP BY account) AS redeemed_boosts
    ON sync_stake.account = redeemed_boosts.account),
    
/* final details */ 
details AS (
    SELECT sync_stake_redeemed.account, 
        last_sync_time, last_sync_time_epoch, 
        now_utc, now_epoch, 
        last_redeem_time, last_redeem_time_epoch, 
        last_collect_time, coalesce(unix_timestamp(to_utc_timestamp(last_collect_time, 'UTC')), 0) AS last_collect_time_epoch, 
        basic_start, program_end, 
        actual_stake, actual_base,
        last_sync_reward, total_boost, coalesce(collected_rewards, 0) AS collected_rewards
    FROM sync_stake_redeemed
    /* Merge Claimed Rewards */
    LEFT JOIN (
        SELECT account, max(evt_block_time) AS last_collect_time, coalesce(sum(rewardAmount)/1e18, 0) AS collected_rewards 
        FROM hopr_protocol_gnosis.HoprStakeSeason5_evt_Claimed
        GROUP BY account) AS collected_rewards
    ON sync_stake_redeemed.account = collected_rewards.account),
    
/* Rewards with projection */ 
rewards_with_projection AS (
    SELECT 
        rewards_till_now - collected_rewards AS rewards_to_collect_till_now, 
        projected_rewards - collected_rewards AS projected_rewards_to_collect, 
        *
    FROM (
        -- FACTOR_DENOMINATOR is 1e12
        SELECT
            ((LEAST(GREATEST(now_epoch, basic_start), program_end)-LEAST(GREATEST(last_sync_time_epoch, basic_start), program_end)) * (actual_base * actual_stake + total_boost * LEAST(actual_stake, 2e5))) / 1e12 -- 150000 cap 
            + last_sync_reward AS rewards_till_now,
            ((LEAST(GREATEST(program_end, basic_start), program_end)-LEAST(GREATEST(last_sync_time_epoch, basic_start), program_end)) * (actual_base * actual_stake + total_boost * LEAST(actual_stake, 2e5))) / 1e12
            + last_sync_reward AS projected_rewards,
            -- 86400 * ((actual_base + total_boost) * LEAST(actual_stake, 1.5e5)) / 1e12 AS daily_growth, -- 86400 denotes the seconds of the day 
            86400 * (actual_base * actual_stake + total_boost * LEAST(actual_stake, 2e5)) / 1e12 AS daily_growth,
            * -- I think the () is wrong here.  
        FROM details
        ORDER BY projected_rewards DESC
    ) t
),

/* Transform Data into a human readable format*/
rewards_with_projection_adj AS (
    SELECT account, actual_stake, rewards_till_now, collected_rewards, rewards_to_collect_till_now, projected_rewards, projected_rewards_to_collect, daily_growth, 
    now_utc, now_epoch,
    last_sync_time, last_sync_time_epoch, last_sync_reward,
    last_redeem_time, last_redeem_time_epoch, last_collect_time, last_collect_time_epoch,
    basic_start AS program_start_epoch,
    to_utc_timestamp(to_timestamp(basic_start)::TIMESTAMP, 'UTC') AS program_start, -- convert Epoch & Unix Timestamp to human-readable date
    program_end AS program_end_epoch,
    to_utc_timestamp(to_timestamp(program_end)::TIMESTAMP, 'UTC') AS program_end,   -- convert Epoch & Unix Timestamp to human-readable date
    ROUND((actual_base / 1e12 * 60 * 60 * 24 * 365), 2) * 100 AS APR, -- convert APR into a percentage
    ROUND((total_boost / 1e12 * 60 * 60 * 24 * 365), 2) * 100 AS total_boost -- convert Total boost into a percentage
    FROM rewards_with_projection),

reward_pool AS (
    SELECT sum(amount)/1e18 AS reward_pool 
    FROM hopr_protocol_gnosis.HoprStakeSeason5_evt_RewardFueled
)

SELECT *, (reward_pool - earned_rewards)/total_daily_growth AS runway
FROM (
    SELECT 
        sum(rewards_till_now) AS earned_rewards,
        sum(rewards_to_collect_till_now) AS total_rewards_to_collect_till_now, 
        sum(projected_rewards) AS total_projected_rewards,
        sum(projected_rewards) - max(reward_pool) AS refill_amount,
        sum(projected_rewards_to_collect) AS total_projected_rewards_to_collect,
        sum(collected_rewards) AS total_collected_rewards_till_now, 
        count(CASE WHEN actual_stake > 0 THEN 1 ELSE NULL END) AS num_staker,
        sum(daily_growth) AS total_daily_growth,
        sum(actual_stake) AS total_actual_at_stake,
        max(reward_pool) AS reward_pool,
        --max(reward_pool) - sum(collected_rewards) AS remainder_of_reward_pool,
        max(reward_pool) - sum(rewards_till_now) AS remainder_of_reward_pool -- What is in the reward pool minus what are the earned rewards to now 
    FROM rewards_with_projection, reward_pool
) t