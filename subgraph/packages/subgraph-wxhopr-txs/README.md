# Subgraph for all wxHOPR transactions

This subgraph lists all wxHOPR transactions visible on-chain. Available parameters for query are: `amount`, sender (`from`), recipient (`to`), and transaction hash (`txHash`).

## Installation
```sh
yarn
```

## Build
Save the latest contract address and their respective start block in the `networks.json`

```sh
yarn codegen
```

## Deployment

### Production
```sh
ENVIRONMENT_TYPE=prod yarn prebuild:env
NETWORK=gnosis yarn build
yarn deploy:studio
```

Query to https://api.studio.thegraph.com/query/40439/subgraph-wxhopr-txs/version/latest
