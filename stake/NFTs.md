# Introduction

Our [Staking program](https://stake.hoprnet.org/) is meant to reward our users for engaging with our protocol and getting rewarded in a similar fashion as they would do by running a HOPR node via `cover-traffic`. All the staking details are publicly available [here](https://medium.com/hoprnet/hopr-staking-program-full-details-d0a4eb12d2c).

# NFTs

The HOPR Association has created a series of NFTs meant to increase participation for our community. Their goal is to,

* Economically boost user's APR in [staking program](https://stake.hoprnet.org/)
* Increase engagement in HOPR's ecosystem, including our [DAO forum](https://forum.hoprnet.org/)
* Provide users with a cool, unique art and proof-of-participation, published in our [Medium](https://medium.com/hoprnet)

## Process for team members

The required steps to create a HOPR Association NFT for our Staking program are as follows:

1. Create a proposal for a campaign and an art description (internally documented).
2. Run the campaign and obtain the Dune Analytics board with the users per category (internally documented).
3. Submit the art and metadata to a decentralized storage (documented below).
4. Mint the NFT with the linked metadata to the registered users (documented in the [stake repo](https://github.com/hoprnet/hopr-stake#batch-mint-nfts))

## Submit the art metadata

1. Save all the specific arts into a folder as `$boostType/$boostRank`, and crunch them to a `<1 MB` file using [squoosh](https://squoosh.app/).
2. Upload this folder and name it as `$boostType` into [IPFS Pinata](https://app.pinata.cloud/pinmanager) (credentials are in our Vault)

![Folder as seen in IPFS Pinata](https://gateway.pinata.cloud/ipfs/QmeDzQmVfRffBu5fH9ZpLp42SeLdMZtAZWZTZ8uPJ4B563/demo_step1.png)

*The folder as seen in IPFS Pinata, make sure to name it as the NFT*

![Folder contents via their Gateway](https://gateway.pinata.cloud/ipfs/QmeDzQmVfRffBu5fH9ZpLp42SeLdMZtAZWZTZ8uPJ4B563/demo_step2.png)

*The contents of the folder as seen via IPFS Pinata gateway*

3. Create a folder named `$boostType` in https://github.com/hoprnet/hopr-devrel/tree/main/stake/packages/frontend/public from the `release/stake` branch.
4. Create inside that folder, all `$boostRank` files with the metadata for each as JSON. Make sure to update `type`, `rank`, `image`, and `boost` accordingly.

```json
{
    "type": "Wildhorn_v2",
    "rank": "bronze",
    "image": "ipfs://QmUdi8CTTmgpj8DrKh2yzoeyb6pVEFKgV3hjaTPmG8Bzn3/bronze.png",
    "deadline": 1642424400,
    "boost": 0.03
}
```
*Make sure to update the `image` URL with the one provided by IPFS pinata BUT with the `ipfs` prefix. For instance, if the image is viewable `https://gateway.pinata.cloud/ipfs/QmeDzQmVfRffBu5fH9ZpLp42SeLdMZtAZWZTZ8uPJ4B563/bronze.png`, the URL in the JSON file should be `ipfs://QmeDzQmVfRffBu5fH9ZpLp42SeLdMZtAZWZTZ8uPJ4B563/bronz.png`*

5. Create a PR and request approval from your branch to `release/stake`. Merge after approval and see it working with a registered user in https://stake.hoprnet.org.

# Important Links

- [All NFTs in circulation and/or available as part of our staking program](https://dune.xyz/queries/227032)
- [HOPR Association minting wallet given permission to mint the NFTs](https://blockscout.com/xdai/mainnet/address/0xD7682Ef1180f5Fc496CF6981e4854738a57c593E/transactions)
- [xDAI NFT Platform supporting our HOPR Boost NFT's](https://app.cargo.build/collection/60fac5840d14af0008329878/)
- [Unnofficial secondary market for HOPR Boost NFT's](https://t.me/HOPR_boost_NFT)