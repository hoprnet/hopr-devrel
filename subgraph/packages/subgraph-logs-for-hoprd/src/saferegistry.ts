import { DergisteredNodeSafe, DomainSeparatorUpdated, RegisteredNodeSafe } from "../generated/HoprNodeSafeRegistry/HoprNodeSafeRegistry";
import { Event } from "../generated/schema";


export function handleDergisteredNodeSafe(event: DergisteredNodeSafe): void {
    let item = new Event(event.transaction.hash.toHex() + event.logIndex.toString())

    item.block_number = event.block.number.toString()
    item.evt_index = event.transaction.toString()
    item.tx_hash = event.transaction.hash.toHex()
    item.evt_name = "DergisteredNodeSafe"

    item.save()
}

export function handleDomainSeparatorUpdated(event: DomainSeparatorUpdated): void {
    let item = new Event(event.transaction.hash.toHex() + event.logIndex.toString())

    item.block_number = event.block.number.toString()
    item.evt_index = event.transaction.toString()
    item.tx_hash = event.transaction.hash.toHex()
    item.evt_name = "DomainSeparatorUpdatedSafeRegistry"

    item.save()
}

export function handleRegisteredNodeSafe(event: RegisteredNodeSafe): void {
    let item = new Event(event.transaction.hash.toHex() + event.logIndex.toString())

    item.block_number = event.block.number.toString()
    item.evt_index = event.transaction.toString()
    item.tx_hash = event.transaction.hash.toHex()
    item.evt_name = "RegisteredNodeSafe"

    item.save()
}

