import { AddressAnnouncement, KeyBinding, RevokeAnnouncement } from "../generated/HoprAnnouncements/HoprAnnouncements";
import { newEvent } from "./utils"


export function handleAddressAnnouncement(event: AddressAnnouncement): void {
    let item = newEvent(event)
    item.evt_name = "AddressAnnouncement"

    item.save()
}

export function handleKeyBinding(event: KeyBinding): void {
    let item = newEvent(event)
    item.evt_name = "KeyBinding"

    item.save()
}

export function handleRevokeAnnouncement(event: RevokeAnnouncement): void {
    let item = newEvent(event)
    item.evt_name = "RevokeAnnouncement"

    item.save()
}

