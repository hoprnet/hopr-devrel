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

### Production (hosted service)
```sh
NETWORK=gnosis yarn build
ACCESS_TOKEN=<access token> NETWORK=gnosis yarn deploy
```
Deployed to https://thegraph.com/hosted-service/subgraph/hoprnet/staking-season6

Query to https://api.thegraph.com/subgraphs/name/hoprnet/staking-season6


### Staging (hosted service)
```sh
NETWORK=goerli yarn build
ACCESS_TOKEN=<access token> NETWORK=goerli yarn deploy:dev
```
Deployed to https://thegraph.com/hosted-service/subgraph/hoprnet/staking-season6-development

Query to https://api.thegraph.com/subgraphs/name/hoprnet/staking-season6-development

### Production
```sh
ENVIRONMENT_TYPE=prod yarn prebuild:env
NETWORK=gnosis yarn build
yarn deploy:studio
```
### Staging
```sh
ENVIRONMENT_TYPE=staging yarn prebuild:env
NETWORK=gnosis yarn build
yarn deploy:studio:staging
```