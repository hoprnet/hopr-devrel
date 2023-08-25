# Subgraph for Dufour network

## Scope

### Safe
In `Dufour` release network, nodes will no longer directly hold HOPR tokens but rather have assets held in a Multisig (Safe). 
Only the following Safe are indexed by the subgraph:
- All the Safe instances created by the `NodeStakeFactory` contract
- Safe instances added to the `NetworkRegistry` contract
- Safe instances added to the `NodeSafeRegistry` contract

### Module
Module instances are proxies. Only module instances created by the `NodeSafeFactory` contract are included in this subgraph.

### Token balance
`wxHOPR`, `mHOPR` and `xHOPR` balances of aforementioned Safes are tracked. Balances are tracked with a base balance queried at the creation block of each Safe, and get updated upon receiving relevant `Transfer` events.

### Network Registry
Although Network Registry (NR) primarily registers Safes created by the NodeStakeFactory contract, it is still possible that NR manager registers a vanilla Safe. If a vanilla safe is added by the 