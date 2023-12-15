import { newMockEvent } from "matchstick-as/assembly/index";
import { AddressAnnouncement, KeyBinding, RevokeAnnouncement } from "../generated/HoprAnnouncements/HoprAnnouncements";


export function createRevokeAnnouncementEvent(): RevokeAnnouncement {
    let event = changetype<RevokeAnnouncement>(newMockEvent())
    event.parameters = new Array()

    return event
}


export function createKeyBindingEvent():KeyBinding  {
    let event = changetype<KeyBinding>(newMockEvent())
    event.parameters = new Array()

    return event
}



export function createAddressAnnouncementEvent(): AddressAnnouncement {
    let event = changetype<AddressAnnouncement>(newMockEvent())
    event.parameters = new Array()

    return event
}
