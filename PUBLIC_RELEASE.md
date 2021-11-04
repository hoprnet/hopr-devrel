# Public Release Checklist

# Introduction

Every `X` amount of time, we share a release that is shared with our community for testing. Usually, this happens every 2-3 weeks, but depending on the issues we might find during the process, this period might extend.

The following checklist is meant to be a step-by-step guide for a HOPR team member to follow in order to prepare a particular HOPR release for our community.

# Glossary

- **Release**: We refer as a release as to a tagged version of `hoprd`, our first client implementation of the HOPR protocol. `hoprd` lives in our [monorepo](https://github.com/hoprnet/hoprnet/tree/master/packages/hoprd), and is usually distributed via [npm](https://www.npmjs.com/package/@hoprnet/hoprd) or [docker](https://hub.docker.com/repository/docker/hopr/hoprd). An example of a release is [`jungfrau`](https://www.npmjs.com/package/@hoprnet/hoprd/v/1.70.8), alias for version `1.70.8`.

- **Internal Release**: An internal release, usually named after a city, is a release that's usually only shared internally between HOPR team members, ambassadors, and close community users. Internal releases have no incentives, require minimal overhead from our team, and are coordinated on an ad-hoc basis. The goal of internal releases is to check functionality and identify easy-to-find bugs in the software.

- **External Release**: An external release, usually named after a Swiss mountain, is a release that's shared across our multiple social media channels and our community in general. External releases are incentivised by NFTs that can be cashed out for APR boosts in our [staking program](https://stake.hoprnet.org/). Due to the nature of these releases, they require coordination with our communications and marketing department, as well as planning ahead of time. The goal of external releases is to increase awareness of the development of the HOPR protocol, boost up our community engagement, and identiy hard-to-find debugs that can only occur on a big-to-massive scale (e.g. 1,000 nodes) and that would be otherwise hard or expensive to test by ourselves alone.

# Checklist for External/Public Release

## Confirm the release has been tagged properly with a Swiss mountain name and tagged for AVADO, NPM and Docker.

- [ ] Verify the name is tagged, has no pre-release tag and visually showing in [npm](https://www.npmjs.com/package/@hoprnet/hoprd/).
- [ ] Verify the name is tagged and visually showing in [Docker Hub](https://hub.docker.com/repository/docker/hopr/hoprd).
- [ ] Verify the package exists, and can be queried in the AVADO Registry[^1].
 
## Update the release documentation on docs.hoprnet.org and blog post to showcase the latest installation instructions and new features.

- [ ] Verify `$external_release` installation instructions is available in `http://docs.hoprnet.org/en/$external_release/src/install-hoprd/index.html`
- [ ] Verify `$external_release` changelog is available instructions `http://docs.hoprnet.org/en/$external_release/src/change-log/inde.html`
- [ ] Coordinate with the Comms team the Medium.com blog post to be used to share the latest release installation instructions and changelog.

## Download the list of staking participants which will be funded with test HOPR and native tokens

- [ ] Download the most up-to-date list of our staking participants from our [Dune board](https://dune.xyz/queries/110685/224484) as a CSV
- [ ] Parse the downloaded CSV with our `csv-to-disperse.sh`[^2] tool to generate the exports for `disperse.app`

## Prepare and send the funds to the staking participants and ambassadors using [Disperse](https://disperse.app/)

- [ ] Reach Community Lead for the most up-to-date list of our ambassadors' addresses as a CSV in the form `$eth_address, 100`
- [ ] Reach Operations for a new wallet 10M test HOPR tokens and 1 native token to use in `disperse.app`
- [ ] Using Disperse, send HOPR tokens in batches of 100 for all staking participants based on the CSV created
- [ ] Using Disperse, send 100 HOPR tokens to all ambassadors shared previously by the Community Lead
- [ ] Using Disperse, send 0.01291 native tokens in batches of 100 for all staking participants and ambassadors

## Prepare Dune Analytics query for displaying user's nodes on-chain activity

- [ ] Ensure `$release`'s `HOPRChannels` smart contract used in `hoprd` has been verified in blockchain explorer.
- [ ] Setup the Dune Analytics dashboard based on the `$release`'s `HOPRChannels` smart contract used in `hoprd`
- [ ] Run a node, execute a few on-chain activity, and look for your node address in said Dashboard.
- [ ] Share with the Comms team the URL for the Dune Analytics dashboard, ensuring it has public access.

[^1]: There's currently no AVADO registry, and the best way to find the latest AVADO release is by following the `HOPR Deploy` workflow in our [monorepo](https://github.com/hoprnet/hoprnet/actions/workflows/deploy.yaml). See [example](https://github.com/hoprnet/hoprnet/issues/2656).

[^2]: There's currently no `csv-to-disperse.sh` script. The closest there is are the commands created by @tolbrino: `cat mhopr.csv | awk -F, '{ printf "%s,%.4f\n", $1, $2;}' > mhopr_short.csv; split -l 100 -d --additional-suffix=.csv mhopr_short.csv mhopr_short_; # double check entry count; cat mhopr_short_0* | sort -n | uniq | wc -l; cat mhopr_short.csv | wc -l`.

# Important Links

- **HOPR Docs:** The official, although a bit outdated documentation can be found in http://docs.hoprnet.org/en/latest/. The source code is in https://github.com/hoprnet/hoprnet/tree/master/docs/hopr-documentation, and it's generated per branch, but not updated properly. It's hosted by [Read The Docs](https://readthedocs.org/), and the following [issue](https://github.com/hoprnet/hoprnet/issues/1960) currently tracks the work needed to properly have live and up-to-date docs.
