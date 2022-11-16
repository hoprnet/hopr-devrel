/* Stake and NFT Development over time */

WITH current_stake AS (
    SELECT 
        (to_utc_timestamp(date_trunc('day', evt_block_time), 'Europe/Zurich')) AS stake_time, 
        sum(actualAmount)/1e18 AS actual_stake
        FROM hopr_protocol_gnosis.HoprStakeSeason5_evt_Staked
    GROUP BY stake_time
    ORDER BY stake_time ASC
), boost_nft AS (
    SELECT boostTypeIndex AS boost_type, boostNumerator AS boost_numerator, redeemDeadline AS redeem_deadline, tokenId AS token_id 
    FROM hopr_protocol_gnosis.HoprBoost_evt_BoostMinted AS boost
    LEFT JOIN hopr_protocol_gnosis.HoprBoost_evt_Transfer AS mint
    ON boost.evt_tx_hash = mint.evt_tx_hash
), redeem AS (
    -- redeemed and registered boosts. All the transferred boosts are saved in an array
    SELECT * FROM (
        SELECT *, row_number() OVER (PARTITION BY account, boost_type ORDER BY boost_numerator DESC, factorRegistered DESC) AS pos,
        array_agg(token_id) OVER (PARTITION BY account ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING) AS transferred_nft_ids,
        array_agg(boost_type) OVER (PARTITION BY account ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING) AS transferred_nft_types
        FROM hopr_protocol_gnosis.HoprStakeSeason5_evt_Redeemed AS redeemed
        LEFT JOIN boost_nft
        ON redeemed.boostTokenId = boost_nft.token_id
    ) t
    -- take rank the redeemed boosts by its order and a valid registration
        WHERE factorRegistered = true AND pos = 1
), stake_redeem_over_time AS (
    SELECT 
        coalesce(stake_time, redeem_time) AS time, coalesce(actual_stake, 0) AS actual_stake, coalesce(redeem_token_num, 0) AS redeem_token
    FROM current_stake
    FULL JOIN (
        SELECT (to_utc_timestamp(date_trunc('day', evt_block_time), 'Europe/Zurich')) AS redeem_time, count(boostTokenId) AS redeem_token_num
        FROM redeem
        GROUP BY redeem_time
    ) redeem_over_time
    ON current_stake.stake_time = redeem_over_time.redeem_time
    ORDER BY time ASC
)

SELECT time, 
    actual_stake, sum(actual_stake) OVER (ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS total_actual_stake, 
    redeem_token, sum(redeem_token) OVER (ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS total_redeem 
FROM stake_redeem_over_time