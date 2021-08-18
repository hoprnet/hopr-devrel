import { log, crypto, Value } from '@graphprotocol/graph-ts'
import { concat } from '@graphprotocol/graph-ts/helper-functions'
import { Announcement, ChannelUpdate } from '../generated/HoprChannels/HoprChannels'
import { Account, Channel } from '../generated/schema'

export function handleAnnouncement(event: Announcement): void {
    log.info(`[ info ] Address of the account announcing itself: {}`, [event.params.account.toHexString()]);
    let account = new Account(event.params.account.toHexString())
    account.multiaddr = event.params.multiaddr;
    account.channels = [];
    account.hasAnnounced = true;
    account.save()
}

export function handleChannelUpdate(event: ChannelUpdate): void {
    log.info(`[ info ] Address of the account updating the channel: {}`, [event.params.source.toHexString()]);
    let channelId = crypto.keccak256(concat(event.params.source, event.params.destination)).toHexString()
    let channel = Channel.load(channelId);
    log.info(`[ info ] Channel ID: {}`, [channelId]);

    if (channel == null) {
        channel = new Channel(channelId);
    }

    log.info(`[ info ] Status: {}`, [event.params.newState.status as string]);
    channel.source = event.params.source.toHexString();
    log.info(`[ info ] Source: {}`, [channel.source]);
    channel.destination = event.params.destination.toHexString();
    log.info(`[ info ] Destination: {}`, [channel.destination]);
    channel.balance = event.params.newState.balance;
    log.info(`[ info ] Balance: {}`, [channel.balance.toString()]);
    channel.commitment = event.params.newState.commitment;
    log.info(`[ info ] Commitment: {}`, [channel.destination]);
    channel.ticketEpoch = event.params.newState.ticketEpoch;
    log.info(`[ info ] ticketEpoch: {}`, [channel.ticketEpoch.toString()]);
    channel.ticketIndex = event.params.newState.ticketIndex;
    log.info(`[ info ] ticketEpoch: {}`, [channel.ticketIndex.toString()]);
    if (event.params.newState.status as string == '') {
        channel.status = 'WAITING_FOR_COMMITMENT'
        log.info(`[ info ] New Status: {}`, [channel.status]);
    } else {
        channel.status = event.params.newState.status as string
        log.info(`[ info ] New Status: {}`, [channel.status]);
    }

    let account = Account.load(channel.source)
    log.info(`[ info ] Account: {}`, [account.id]);
    let channels = account.channels;
    log.info(`[ info ] Channels: {}`, [channels.length.toString()]);
    channels.push(channelId);
    account.channels = channels;
    account.save()

    /*
     * See https://github.com/hoprnet/hoprnet/blob/215d406a07f43078df9d517953d3789036668705/packages/utils/src/types/channelEntry.ts#L7-L12
     * Closed = 0,
     * WaitingForCommitment = 1,
     * Open = 2,
     * PendingToClose = 3
     */
    if (event.params.newState.status == 2) {
        channel.openedAt = event.block.timestamp;
    } else if (event.params.newState.status == 0) {
        channel.closedAt = event.block.timestamp;
    }
    channel.save();
}