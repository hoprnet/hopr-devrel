# Subgraph for Staking Season 3

## Build
Save the latest contract address and their respective start block in the `networks.json`

```sh
yarn codegen
yarn build
```

## Deployment

### Production
Deployed to https://thegraph.com/hosted-service/subgraph/hoprnet/staking-season3

Query to https://api.thegraph.com/subgraphs/name/hoprnet/staking-season3

```sh
yarn deploy:xdai
```

### Staging
Deployed to https://thegraph.com/hosted-service/subgraph/hoprnet/staking-season3-master-goerli

Query to https://api.thegraph.com/subgraphs/name/hoprnet/staking-season3-master-goerli

```sh
yarn deploy:master-goerli
```