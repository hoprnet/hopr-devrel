# Dune Analytics Payment Channel Analysis Table

This project contains queries and dashboard source code for Dune Analytics Payment Channel Analysis Table

Created in scope of https://gitcoin.co/issue/28790 bounty.

## Queries

* HOPR Node Announcements : https://dune.com/queries/1233765
* Gnosis HOPR accounting by address (forked from @qyuqianchen with thHOPR added) : https://dune.com/queries/1233748
* Gnosis HOPR incoming transfers by address : https://dune.com/queries/1233873
* Gnosis HOPR outgoing transfers by address : https://dune.com/queries/1233857
* HOPR Funded Not Closed Channels by Node: https://dune.com/queries/1237370
* HOPR Funded Channels by Node https://dune.com/queries/1240679

## Dashboard

Example nodes dashboards

Main table, shows node announcements with last publicKey and Dune hyper links to node data

* https://dune.com/korrrba/hopr-node-announcements-and-payment-channels-analytics

Example node data: incoming/outgoing HOPR, number of funded channels (all states including closed) and all states excluding closed

* https://dune.com/korrrba/hopr-payment-channel-by-node?account=0x57a0dfc455413bff5a07852ea4ed81163e64b263
* https://dune.com/korrrba/hopr-payment-channel-by-node?account=0x30fc9c5a173590ab37e7ebf5b949f433d998d872

NOTE: If dashboards show 'No results from query.' in any table, it memay mean that the node did not fund payment channels or did not send / receive HOPR/ txHOPR tokens (just announced itself).