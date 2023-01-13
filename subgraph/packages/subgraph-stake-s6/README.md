# Subgraph for Staking Season 6

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
yarn build --network gnosis
ACCESS_TOKEN=<access token> NETWORK=gnosis yarn deploy
```
Deployed to https://thegraph.com/hosted-service/subgraph/hoprnet/staking-season6

Query to https://api.thegraph.com/subgraphs/name/hoprnet/staking-season6


### Staging
```sh
yarn build --network goerli
ACCESS_TOKEN=<access token> NETWORK=goerli yarn deploy:dev
```
Deployed to https://thegraph.com/hosted-service/subgraph/hoprnet/staking-season6-development

Query to https://api.thegraph.com/subgraphs/name/hoprnet/staking-season6-development
