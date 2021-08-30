import { Announcement, ChannelUpdate } from '../generated/HoprChannels/HoprChannels'
import { Account, Channel, Transaction } from '../generated/schema'
import { accounts, channels } from './utils';
import { transactions } from './utils/transactions';

export function handleAnnouncement(event: Announcement): void {
    let account = accounts.getAccount(event.transaction.from) as Account
    account.multiaddr = event.params.multiaddr;
    account.hasAnnounced = true;
    account.save()
}

export function handleChannelUpdate(event: ChannelUpdate): void {
    let tx = transactions.log(event) as Transaction
    let channel = channels.create(event, tx) as Channel
    channel.save()
}