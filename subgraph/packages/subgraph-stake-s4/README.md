# Subgraph for Staking Season 4

## Build
Save the latest contract address and their respective start block in the `networks.json`

```sh
yarn codegen
yarn build
```

## Deployment

### Production (hosted service)
Deployed to https://thegraph.com/hosted-service/subgraph/hoprnet/staking-season4

Query to https://api.thegraph.com/subgraphs/name/hoprnet/staking-season4

```sh
yarn deploy:xdai
```

### Production
```sh
yarn deploy:studio
```