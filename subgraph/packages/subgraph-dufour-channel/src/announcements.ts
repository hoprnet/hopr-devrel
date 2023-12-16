import { log } from '@graphprotocol/graph-ts'
import { RevokeAnnouncement, KeyBinding, AddressAnnouncement } from '../generated/HoprAnnouncements/HoprAnnouncements'
import { Account, Announcement } from '../generated/schema'
import { getOrInitiateAccount } from './library';

export function handleRevokeAnnouncement(event: RevokeAnnouncement): void {
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
    let announcement = new Announcement(event.transaction.hash.toHex())

    announcement.ed25519_sig = [event.params.ed25519_sig_0, event.params.ed25519_sig_1]
    announcement.publicKey = event.params.ed25519_pub_key
    announcement.multiaddr = event.params.chain_key
    announcement.hasAnnouced = false

    announcement.save()
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
