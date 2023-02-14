import { log } from "@graphprotocol/graph-ts"
import { HoprBoost, Transfer } from "../generated/HoprBoost/HoprBoost"
import { Boost } from "../generated/schema"
import { ADDRESS_ZERO, getOrInitializeAccount } from "./library"

export function handleTransfer(event: Transfer): void {
    let boost = Boost.load(event.params.tokenId.toString())
    let boostContract = HoprBoost.bind(event.address)
    if (!boost) {
        if (event.params.from.toHexString() == ADDRESS_ZERO) {
            // initialize a new boost
            boost = new Boost(event.params.tokenId.toString())
            boost.boostTypeIndex = boostContract.typeIndexOf(event.params.tokenId)
            let boostDetails = boostContract.boostOf(event.params.tokenId)
            boost.boostNumerator = boostDetails.value0
            boost.redeemDeadline = boostDetails.value1
        } else {
            log.error('Cannot transfer a non-existing nft', [])
            return
        }
    }
    boost.uri = boostContract.tokenURI(event.params.tokenId)
    let owner = getOrInitializeAccount(event.params.to.toHex())
    boost.owner = owner.id
    boost.save()
  }