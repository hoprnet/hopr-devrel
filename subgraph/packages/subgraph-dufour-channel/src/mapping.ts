import { Address, log } from '@graphprotocol/graph-ts'
import { ChannelBalanceDecreased, ChannelBalanceIncreased, ChannelClosed, ChannelOpened, DomainSeparatorUpdated, LedgerDomainSeparatorUpdated, OutgoingChannelClosureInitiated, TicketRedeemed, HoprChannels } from '../generated/HoprChannels/HoprChannels'
import { Account, Channel, Ticket } from '../generated/schema'
import { convertEthToDecimal, convertStatusToEnum, createStatusSnapshot, getChannelId, getOrInitiateAccount, initiateChannel, oneBigInt, zeroBD } from './library';


export function handleChannelBalanceDecreased(event: ChannelBalanceDecreased): void {
    let channelId = event.params.channelId.toHex()
    let channel = Channel.load(channelId)


    if (channel == null) {
        log.error("Decrease balance for non-existing channel", [])
        return
    }

    channel.balance = convertEthToDecimal(event.params.newBalance)
    channel.lastOpenedAt = event.block.timestamp

    channel.save()
}

export function handleChannelBalanceIncreased(event: ChannelBalanceIncreased): void {
    let channelId = event.params.channelId.toHex()
    let channel = Channel.load(channelId)


    if (channel == null) {
        log.error("Increase balance for non-existing channel", [])
        return
    }

    channel.balance = convertEthToDecimal(event.params.newBalance)
    channel.lastOpenedAt = event.block.timestamp

    channel.save()
}

export function handleChannelClosed(event: ChannelClosed): void {
    let channelId = event.params.channelId.toHex()
    let channel = Channel.load(channelId)

    if (channel == null) {
        log.error("Closing non-existing channel", [])
        return
    }

    channel.lastClosedAt = event.block.timestamp

    channel.save()
}

export function handleChannelOpened(event: ChannelOpened): void {
    // channel source
    let sourceId = event.params.source.toHex()
    let source = getOrInitiateAccount(sourceId)

    // channel destination
    let destinationId = event.params.destination.toHex()
    let destination = getOrInitiateAccount(destinationId)

    // channelId
    let channelId = getChannelId(event.params.source, event.params.destination).toHex()

    source.fromChannelsCount = source.fromChannelsCount.plus(oneBigInt())
    source.save()

    destination.toChannelsCount = destination.toChannelsCount.plus(oneBigInt())
    destination.save()

    // let channel = initiateChannel(channelId, sourceId, destinationId)
    // channel.lastOpenedAt = event.block.timestamp
    // channel.save()
}

export function handleDomainSeparatorUpdated(event: DomainSeparatorUpdated): void {
}

export function handleLedgerDomainSeparatorUpdated(event: LedgerDomainSeparatorUpdated): void {
}

export function handleOutgoingChannelClosureInitiated(event: OutgoingChannelClosureInitiated): void {
}

export function handleTicketRedeemed(event: TicketRedeemed): void {
    // get the channel epoch, which is not part of the event
    let channelContract = HoprChannels.bind(event.address)
    let channelId = event.params.channelId
    let channelEpoch = channelContract.channels(channelId).getEpoch()
    // let ticketEpoch = event.params.ticketEpoch
    let ticketIndex = event.params.newTicketIndex

    // create new ticket
    let ticketId = channelId.toHex() + "-" + channelEpoch.toString() + "-" + ticketIndex.toString()
    // let ticketId = channelId.toHex() + "-" + channelEpoch.toString() + "-" + ticketEpoch.toString() + "-" + ticketIndex.toString()

    let ticket = new Ticket(ticketId)
    ticket.channel = channelId.toHex()
    // ticket.nextCommitment = event.params.nextCommitment
    // ticket.ticketEpoch = ticketEpoch
    ticket.ticketIndex = ticketIndex
    // ticket.proofOfRelaySecret = event.params.proofOfRelaySecret
    // ticket.amount = convertEthToDecimal(event.params.amount)
    // ticket.winProb = event.params.winProb
    // ticket.signature = event.params.signature

    // update channel
    let channel = Channel.load(channelId.toHex())
    if (channel == null) {
        log.error("Redeem a ticket for non-existing channel", [])
    } else {
        channel.redeemedTicketCount = channel.redeemedTicketCount.plus(oneBigInt())
        channel.save()
    }
    ticket.save()
}
