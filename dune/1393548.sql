WITH mint AS (
    SELECT to, boostType, boostNumerator, redeemDeadline, call_block_number, call_block_time, call_tx_hash  
    FROM hopr_protocol_gnosis.HoprBoost_call_mint
    WHERE call_success = TRUE
), batch_mint AS (
    SELECT explode(to), boostType, boostNumerator, redeemDeadline, call_block_number, call_block_time, call_tx_hash 
    FROM hopr_protocol_gnosis.HoprBoost_call_batchMint
    WHERE call_success = TRUE
), all_entries AS (
    SELECT * FROM mint
    UNION ALL
    SELECT * FROM batch_mint
    ORDER BY call_block_number ASC
), joint_type_index AS (
    SELECT boostType, boostTypeIndex, call_block_number
    FROM all_entries
    LEFT JOIN hopr_protocol_gnosis.HoprBoost_evt_BoostMinted AS boost_minted
    ON all_entries.call_tx_hash = boost_minted.evt_tx_hash
), joint_type_index_adj AS (
    SELECT boostType, boostTypeIndex, max(call_block_number)
    FROM joint_type_index
    GROUP BY boostType, boostTypeIndex
    ORDER BY boostTypeIndex ASC
), nft_events AS (
    SELECT boostTypeIndex AS type_index, -1 AS evt_block_number, 'allowed' AS event -- minted NFTs assumed to be allowed as initial state
    FROM hopr_protocol_gnosis.HoprBoost_evt_BoostMinted
    UNION
    SELECT typeIndex AS type_index, evt_block_number, 'blocked' AS event
    FROM hopr_protocol_gnosis.HoprStakeSeason5_evt_NftBlocked
    UNION
    SELECT typeIndex AS type_index, evt_block_number, 'allowed' AS event 
    FROM hopr_protocol_gnosis.HoprStakeSeason5_evt_NftAllowed
) -- get all nft events (mint, block & allow with evt_block_number for chronology)
-- use -1 as evt_block_number for mint events to place past and future mints first in this chronology which always gives block and allow events authority over state

SELECT nft_events.type_index as index, joint_type_index_adj.boostType as name, nft_events.event AS state
FROM nft_events
LEFT JOIN joint_type_index_adj-- add "names"
ON nft_events.type_index =  joint_type_index_adj.boostTypeIndex
WHERE evt_block_number = (
    SELECT MAX(evt_block_number) -- get only the highest blocknumber, which has the latest event, which has the current state of "allowed or blocked"
    FROM nft_events AS latest_nft_events
    WHERE nft_events.type_index = latest_nft_events.type_index
)
ORDER BY nft_events.type_index