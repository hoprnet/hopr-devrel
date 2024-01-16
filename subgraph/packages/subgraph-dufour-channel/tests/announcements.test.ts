import { test, describe, assert, logStore } from "matchstick-as/assembly/index";
import { createAddressAnnouncementEvent, createKeyBindingEvent, createRevokeAnnouncementEvent } from "./announcements.utils";
import { handleAddressAnnouncement, handleKeyBinding, handleRevokeAnnouncement } from "../src/announcements";
import { getOrInitiateAccount } from "../src/library";


describe("RevokeAnnouncement", () => {
    test("Revocations set hasAnnounced to false", () => {
        let node = "0x89205a3a3b2a69de6dbf7f01ed13b2108b2c43e7"
        let baseMultiaddr = "/ip4/"

        let account = getOrInitiateAccount(node)
        account.multiaddr = [baseMultiaddr]
        account.hasAnnounced = true
        account.save()

        assert.entityCount("Account", 1)
        assert.fieldEquals("Account", node, "hasAnnounced", "true")

        let event = createRevokeAnnouncementEvent(node)
        handleRevokeAnnouncement(event)

        assert.entityCount("Account", 1)
        assert.fieldEquals("Account", node, "hasAnnounced", "false")

    })
})

describe("KeyBinding", () => {
    test("Binding creates new account", () => {
        let sig0 = "0x1234"
        let sig1 = "0x5678"
        let publicKey = "0x0001"
        let chain_key = "0xc0ffee254729296a45a3885639ac7e10f9d54979"

        let event = createKeyBindingEvent(sig0, sig1, publicKey, chain_key)
        handleKeyBinding(event)

        let txHash = event.transaction.hash.toHex()

        assert.entityCount("Announcement", 1)
        assert.fieldEquals("Announcement", txHash, "ed25519_sig", `[${sig0}, ${sig1}]`)
        assert.fieldEquals("Announcement", txHash, "publicKey", publicKey)
    })
})

describe("AddressAnnouncement", () => {
    test("Announcement creates new account", () => {
        let node = "0x89205a3a3b2a69de6dbf7f01ed13b2108b2c43e7"
        let baseMultiaddr = "/ip4/"

        let event = createAddressAnnouncementEvent(node, baseMultiaddr)
        handleAddressAnnouncement(event)

        assert.entityCount("Account", 1)
        assert.fieldEquals("Account", node, "multiaddr", `[${baseMultiaddr}]`)
        assert.fieldEquals("Account", node, "hasAnnounced", "true")
    })

    test("Announcement appends new baseMultiaddr", () => {
        let node = "0x89205a3a3b2a69de6dbf7f01ed13b2108b2c43e7"
        let baseMultiaddrs = ["/ip4/", "/ip6/"]

        handleAddressAnnouncement(createAddressAnnouncementEvent(node, baseMultiaddrs[0]))
        handleAddressAnnouncement(createAddressAnnouncementEvent(node, baseMultiaddrs[1]))


        assert.entityCount("Account", 1)
        assert.fieldEquals("Account", node, "multiaddr", `[${baseMultiaddrs.join(", ")}]`)
        assert.fieldEquals("Account", node, "hasAnnounced", "true")
    })
})
