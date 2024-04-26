import { AddressAnnouncement, KeyBinding, RevokeAnnouncement } from "../generated/HoprAnnouncements/HoprAnnouncements";
import { Event } from "../generated/schema";


export function handleAddressAnnouncement(event: AddressAnnouncement): void {
    let item = new Event(event.transaction.hash.toHex() + event.logIndex.toString())

    item.block_number = event.block.number.toString()
    item.evt_index = event.transaction.toString()
    item.tx_hash = event.transaction.hash.toHex()
    item.evt_name = "AddressAnnouncement"

    item.save()
}

export function handleKeyBinding(event: KeyBinding): void {
    let item = new Event(event.transaction.hash.toHex() + event.logIndex.toString())

    item.block_number = event.block.number.toString()
    item.evt_index = event.transaction.toString()
    item.tx_hash = event.transaction.hash.toHex()
    item.evt_name = "KeyBinding"

    item.save()
}

export function handleRevokeAnnouncement(event: RevokeAnnouncement): void {
    let item = new Event(event.transaction.hash.toHex() + event.logIndex.toString())

    item.block_number = event.block.number.toString()
    item.evt_index = event.transaction.toString()
    item.tx_hash = event.transaction.hash.toHex()
    item.evt_name = "RevokeAnnouncement"

    item.save()
}

