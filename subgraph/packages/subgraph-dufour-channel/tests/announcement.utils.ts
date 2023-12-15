import { newMockEvent } from "matchstick-as/assembly/index";
import { AddressAnnouncement, KeyBinding, RevokeAnnouncement } from "../generated/HoprAnnouncements/HoprAnnouncements";
import { Address, Bytes, ethereum, log } from "@graphprotocol/graph-ts";


export function createRevokeAnnouncementEvent(): RevokeAnnouncement {
    let event = changetype<RevokeAnnouncement>(newMockEvent())
    event.parameters = new Array()

    return event
}


export function createKeyBindingEvent(sig_0: string, sig_1: string, publicKey: string, chain_key: string): KeyBinding {
    let event = changetype<KeyBinding>(newMockEvent())
    event.parameters = new Array()

    let ed25519_sig_0Param = new ethereum.EventParam("ed25519_sig_0", ethereum.Value.fromBytes(Bytes.fromHexString(sig_0)))
    let ed25519_sig_1Param = new ethereum.EventParam("ed25519_sig_1", ethereum.Value.fromBytes(Bytes.fromHexString(sig_1)))
    let ed25519_pub_keyParam = new ethereum.EventParam("ed25519_pub_key", ethereum.Value.fromBytes(Bytes.fromHexString(publicKey)))
    let chain_keyParam = new ethereum.EventParam("chain_key", ethereum.Value.fromAddress(Address.fromString(chain_key)))

    event.parameters.push(ed25519_sig_0Param)
    event.parameters.push(ed25519_sig_1Param)
    event.parameters.push(ed25519_pub_keyParam)
    event.parameters.push(chain_keyParam)

    return event
}


export function createAddressAnnouncementEvent(node: string, baseMultiaddr: string): AddressAnnouncement {
    let event = changetype<AddressAnnouncement>(newMockEvent())
    event.parameters = new Array()

    let nodeParam = new ethereum.EventParam("node", ethereum.Value.fromAddress(Address.fromString(node)))
    let baseMultiaddrParam = new ethereum.EventParam("baseMultiaddr", ethereum.Value.fromString(baseMultiaddr))

    event.parameters.push(nodeParam)
    event.parameters.push(baseMultiaddrParam)

    return event
}
