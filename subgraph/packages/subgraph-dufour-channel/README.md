# Subgraph for HoprChannels

This subgraph gets updated to index the latest production HOPR network.
Currently it's deployed for "Dufour" network.

## Development
1. Install

```sh
yarn install && yarn codegen
export DUFOUR_SUBGRAPH_NAME=hopr-channels
```

2. Create a project in Subgraph studio, if not done

```sh
npx graph init --studio $DUFOUR_SUBGRAPH_NAME
npx graph auth --studio
```

3. Build the subgraph
```sh
yarn build
```

4. Deploy to Subgraph Studio
```sh
npx graph deploy --studio $DUFOUR_SUBGRAPH_NAME
```

## Deployment
- Deployment ID: QmNSBAgoudxv5Qk9Yj16yz9U8MPbiSTUfjQi4njAuNksBu
- Query: https://gateway.thegraph.com/api/[api-key]/subgraphs/id/Feg6Jero3aQzesVYuqk253NNLyNAZZppbDPKFYEGJ1Hj
- Explorer: https://thegraph.com/explorer/subgraphs/Feg6Jero3aQzesVYuqk253NNLyNAZZppbDPKFYEGJ1Hj?view=Overview&chain=mainnet