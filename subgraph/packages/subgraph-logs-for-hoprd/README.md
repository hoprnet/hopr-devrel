# Subgraph for TODO

TODO


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

Query to TODO
