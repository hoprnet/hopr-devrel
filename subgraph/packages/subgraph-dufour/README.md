# Subgraph for Dufour network

## Scope

### Safe
In `Dufour` release network, nodes will no longer directly hold HOPR tokens but rather have assets held in a Multisig (Safe). 
Only the following Safe are indexed by the subgraph:
- All the Safe instances created by the `NodeStakeFactory` contract (flagged with `isCreatedByNodeStakeFactory`)
- Safe instances (could also be EOAs or an arbitrary contract) added to the `NetworkRegistry` contract
- Safe instances (could also be EOAs or an arbitrary contract) added to the `NodeSafeRegistry` contract
- Safe instances (could also be EOAs or an arbitrary contract) set as `owner` (`target`) by the node management modules created by the NodeStakeFactory

### NodeManagementModule
Module instances are proxies. Only module instances created by the `NodeSafeFactory` contract are included in this subgraph.

Note that field `addedModules` of `Safe` may contain generic modules. Addresses in that field are not necessarily node management modules

### Token balance
`wxHOPR`, `mHOPR` and `xHOPR` balances of aforementioned Safes are tracked. Balances are tracked with a base balance queried at the creation block of each Safe, and get updated upon receiving relevant `Transfer` events.

#### Allowance
`allowances` in `Safe` refer to respecitive token allowances granted to the given `grantedToChannelsContract` address. This value is set as `CHANNELS_CONTRACT_ADDRESS` in `subgraph/packages/subgraph-dufour/src/constants.ts`

### Network Registry
Although Network Registry (NR) primarily registers Safes created by the NodeStakeFactory contract, it is still possible that NR manager registers a vanilla Safe or an arbitrary account.

### NodeSafe Registry
Although Node Safe Registry (NR) primarily registers Safes created by the NodeStakeFactory contract, it is still possible that a vanilla Safe gets registered.