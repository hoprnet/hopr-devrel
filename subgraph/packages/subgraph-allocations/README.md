# Subgraph for token allocations

This subgraph summaries the various allocation and schedule by account.

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
