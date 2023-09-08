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

### Allowance
`allowances` in `Safe` refer to respecitive token allowances granted to the given `grantedToChannelsContract` address. This value is set as `CHANNELS_CONTRACT_ADDRESS` in `subgraph/packages/subgraph-dufour/src/constants.ts`

### Network Registry
Although Network Registry (NR) primarily registers Safes created by the NodeStakeFactory contract, it is still possible that NR manager registers a vanilla Safe or an arbitrary account.

### NodeSafe Registry
Although Node Safe Registry (NR) primarily registers Safes created by the NodeStakeFactory contract, it is still possible that a vanilla Safe gets registered.

## Development
1. Install

```sh
yarn install && yarn codegen
export DUFOUR_SUBGRAPH_NAME=hopr-nodes-dufour
```

2. Create a project in Subgraph studio, if not done

```sh
npx graph init --studio $DUFOUR_SUBGRAPH_NAME
npx graph auth --studio
```

3. Configure contract addresses for networks
- Find if a network configuration file is created under `./networks/*-networks.json`. If not, create one. Here we take the `rotsee-networks.json` as an example.
- Update `NodeStakeFactory`, `NodeSafeRegistry` and `NetworkRegistry` contract addresses. Use the smallest "contract creation block number" of those aforementioned three contracts for ALL THE `startBlock`, including those for HOPR tokens.
- Update the `CHANNELS_CONTRACT_ADDRESS` in `./src/constants.ts` with the "HoprChannels" contract address for the selected network. The `CHANNELS_CONTRACT_ADDRESS`  for the production network is the default.
- Once all the changes are saved, run

```sh
yarn build --network gnosis --network-file <path to the configuration file, e.g. ./networks/rotsee-networks.json>
```

4. Deploy to Subgraph Studio
```sh
npx graph deploy --studio $DUFOUR_SUBGRAPH_NAME
```

Note:
- legacy `test` network (with mHOPR) is deployed at version `v0.0.x`
- `rotsee` network (with wxHOPR) is deployed at version `v0.1.x`


## Deployment
- Rotsee: QmQJMMWn8DWXuoX4B2kEUj4Ld3czrrnVZ4xuFH7Z7v4X8u
- Dufour: QmU9EryV27sDD9RDRdE6QEvw8QYx5gdp6MSRSxk9j4NG43

## Query

A sample query:

```graphql
{
  safes(first: 5, where: {isCreatedByNodeStakeFactory: true}) {
    id
    balance {
      mHoprBalance
      wxHoprBalance
      xHoprBalance
    }
    threshold
    owners {
      owner {
        id
      }
    }
    isCreatedByNodeStakeFactory
    targetedModules {
      id
    }
    allowance {
      xHoprAllowance
      wxHoprAllowance
      mHoprAllowance
      grantedToChannelsContract
    }
    addedModules {
      module {
        id
      }
    }
    isEligibleOnNetworkRegistry
    registeredNodesInSafeRegistry {
      node {
        id
      }
    }
    registeredNodesInNetworkRegistry {
      node {
        id
      }
    }
  }
  _meta {
    hasIndexingErrors
    deployment
  }
  nodeManagementModules {
    id
    implementation
    includedNodes {
      node {
        id
      }
    }
    multiSend
    target {
      id
    }
  }
  balances(where: {id: "all_the_safes"}) {
    mHoprBalance
    wxHoprBalance
    xHoprBalance
    id
  }
}
```