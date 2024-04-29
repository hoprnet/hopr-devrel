import { Event } from "../generated/schema";
import { ethereum } from "@graphprotocol/graph-ts";

export function fillEvent(item: Event, event: ethereum.Event): Event {
    item.block_number = event.block.number.toString()
    item.log_index = event.logIndex.toString()
    item.tx_index = event.transaction.index.toString()
    item.tx_hash = event.transaction.hash.toHex()

    return item
}