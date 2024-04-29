import { AddressAnnouncement, KeyBinding, RevokeAnnouncement } from "../generated/HoprAnnouncements/HoprAnnouncements";
import { Event } from "../generated/schema";
import { fillEvent } from "./utils"


export function handleAddressAnnouncement(event: AddressAnnouncement): void {
    let item = new Event(event.transaction.hash.toHex() + event.logIndex.toString())
    item = fillEvent(item, event)
    item.evt_name = "AddressAnnouncement"

    item.save()
}

export function handleKeyBinding(event: KeyBinding): void {
    let item = new Event(event.transaction.hash.toHex() + event.logIndex.toString())
    item = fillEvent(item, event)
    item.evt_name = "KeyBinding"

    item.save()
}

export function handleRevokeAnnouncement(event: RevokeAnnouncement): void {
    let item = new Event(event.transaction.hash.toHex() + event.logIndex.toString())
    item = fillEvent(item, event)
    item.evt_name = "RevokeAnnouncement"

    item.save()
}

