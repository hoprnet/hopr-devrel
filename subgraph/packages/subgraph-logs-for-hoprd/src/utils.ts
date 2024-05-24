import { Event } from "../generated/schema";
import { ethereum } from "@graphprotocol/graph-ts";

export function newEvent(event: ethereum.Event): Event {
    let item = new Event(event.transaction.hash.toHex() + event.logIndex.toString())

    item.block_number = event.block.number.toString()
    item.log_index = event.logIndex.toString()
    item.tx_index = event.transaction.index.toString()
    item.tx_hash = event.transaction.hash.toHex()

    return item
}