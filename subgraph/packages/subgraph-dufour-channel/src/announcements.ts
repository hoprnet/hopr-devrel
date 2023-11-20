import { log } from '@graphprotocol/graph-ts'
import { RevokeAnnouncement, KeyBinding, AddressAnnouncement } from '../generated/HoprAnnouncements/HoprAnnouncements'
import { Channel, Ticket, Account } from '../generated/schema'
import { getOrInitiateAccount } from './library';

export function handleRevokeAnnoucement(event: RevokeAnnouncement): void {
    let accountId = event.params.node.toHex()
    let account = Account.load(accountId)

    if (account == null) {
        log.error("Revoke announcement for non-existing account", [])
        return
    }

    account.hasAnnounced = false
    account.save()
}

export function handleKeyBinding(event: KeyBinding): void {
    let accountId = "foo"

    let account = getOrInitiateAccount(accountId)
    account.publicKey = event.params.ed25519_pub_key
    event.params.chain_key
    account.save()
}

export function handleAddressAnnouncement(event: AddressAnnouncement): void {
    let accountId = event.params.node.toHex();
    let account = getOrInitiateAccount(accountId)
    let multiaddr = account.multiaddr

    if (multiaddr.indexOf(event.params.baseMultiaddr) == -1) {
        multiaddr.push(event.params.baseMultiaddr)
    }

    account.multiaddr = multiaddr
    account.hasAnnounced = true;
    account.save()
}
