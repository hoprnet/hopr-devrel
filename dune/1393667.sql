/* Staked NFT's of type community */

/* Accounts and there staking amounts */ 
WITH season_stake AS (
    SELECT account, sum(actualAmount)/1e18 AS season_stake 
    FROM (SELECT account, actualAmount FROM hopr_protocol_gnosis.HoprStakeSeason5_evt_Staked) AS t  
    GROUP BY t.account), 

/* Associate token ID's with boost types */ 
boost_nft AS ( -- Boost types (i.e. hodler nft is a type and indexed by a numerical value)
    SELECT boostTypeIndex AS boost_type, boostNumerator AS boost_numerator, redeemDeadline AS redeem_deadline, tokenId AS token_id 
    FROM hopr_protocol_gnosis.HoprBoost_evt_BoostMinted AS boost  -- maps NFT boost type and factor with events 
    LEFT JOIN hopr_protocol_gnosis.HoprBoost_evt_Transfer AS mint -- maps NFT transfers between accounts and tokden ID with events 
    ON boost.evt_tx_hash = mint.evt_tx_hash), -- Distinct events come from the fact that NFT's can be minted in batches (50 max per unique transaction)

/* Redeemed and Registered Boosts. All the transferred boosts are saved in an array */   
redeemed AS (
    SELECT * 
    FROM (SELECT *, row_number() OVER (PARTITION BY account, boost_type ORDER BY boost_numerator DESC, factorRegistered DESC) AS pos, 
        array_agg(token_id) OVER (PARTITION BY account ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING) AS transferred_nft_ids, -- map all token id's associate with an account into an array 
        array_agg(boost_type) OVER (PARTITION BY account ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING) AS transferred_nft_types -- same with bost 
        FROM hopr_protocol_gnosis.HoprStakeSeason5_evt_Redeemed AS redeemed -- info about account and tokden ID 
        LEFT JOIN boost_nft -- Join boost NFT table by token ID 
        ON redeemed.boostTokenId = boost_nft.token_id) AS t
    WHERE factorRegistered = true AND pos = 1),

/* Merge NFT info with staking info by account */
redeemed_stake AS (
    SELECT redeemed.account, token_id, boost_type, season_stake, transferred_nft_ids, transferred_nft_types
    FROM redeemed
    LEFT JOIN season_stake
    ON redeemed.account = season_stake.account),

/* Additional NFT information */   
mintCall AS (
    SELECT boostType, boostRank, call_tx_hash
    FROM hopr_protocol_gnosis.HoprBoost_call_mint
    WHERE call_success = true
    UNION 
    SELECT boostType, boostRank, call_tx_hash FROM 
    hopr_protocol_gnosis.HoprBoost_call_batchMint
    WHERE call_success = true
),

/* Join NFT information with minting information */
allMinted AS ( 
    SELECT tokenId, boostType, boostRank, to, evt_tx_hash, evt_block_time
    FROM hopr_protocol_gnosis.HoprBoost_evt_Transfer
    INNER JOIN mintCall ON call_tx_hash = evt_tx_hash
    WHERE from = '0x0000000000000000000000000000000000000000' 
),

/* Join redeemed stake with additional NFT information */
redeemed_stake_nft AS (
   SELECT *
   FROM redeemed_stake
   LEFT JOIN (SELECT tokenId, boostType, boostRank FROM allMinted) AS nft_info
   ON redeemed_stake.token_id = nft_info.tokenId),
   
redeemed_stake_nft_adj AS ( 
SELECT account, token_id, season_stake AS stake_s05, boostType, boostRank, transferred_nft_types
FROM redeemed_stake_nft
WHERE (season_stake >= 1000 AND boost_type = 26 AND boostRank = 'community') -- 26: Network Registry NFT Community: Community NFT
) 

SELECT * 
FROM redeemed_stake_nft_adj
ORDER BY token_id DESC

/* 
SELECT *
FROM redeemed_stake
WHERE boost_type = 26 -- Network Registry NFT
*/