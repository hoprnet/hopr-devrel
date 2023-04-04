# Subgraph for all the staking seasons

## Installation
```sh
yarn
```

## Build
```sh
yarn codegen
```

## Deployment

### Production
```sh
yarn build
yarn deploy:studio
```

## Development
1. `HoprStake` (season 1) uses the `HoprStake.json` ABI. `HoprStakeBase.json` is used in season 5 and 6. Season 3 and 4 emit the same events as in `HoprStakeBase.json`. Season 2 doesn't habe `NftBlocked` and `NftAllowed` events. `virtualAmount` is only used in Season 1.