# Subgraph for Staking Season 5

## Build
Save the latest contract address and their respective start block in the `networks.json`

```sh
yarn codegen
```

## Deployment

### Production
```sh
yarn build --network xdai
ACCESS_TOKEN=<access token> yarn deploy-xdai
```
Deployed to https://thegraph.com/hosted-service/subgraph/hoprnet/staking-season5

Query to https://api.thegraph.com/subgraphs/name/hoprnet/staking-season5


### Staging
```sh
yarn build --network goerli
ACCESS_TOKEN=<access token> yarn deploy-goerli
```
Deployed to https://thegraph.com/hosted-service/subgraph/hoprnet/staking-season5-development

Query to https://api.thegraph.com/subgraphs/name/hoprnet/staking-season5-development
