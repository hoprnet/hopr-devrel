import { BigInt, log } from '@graphprotocol/graph-ts'
import { ChannelBalanceDecreased, ChannelBalanceIncreased, ChannelClosed, ChannelOpened, OutgoingChannelClosureInitiated, TicketRedeemed, HoprChannels, RedeemTicketCall } from '../generated/HoprChannels/HoprChannels'
import { Channel, Ticket } from '../generated/schema'
import { amountInTicketFromHash, convertEthToDecimal, convertStatusToEnum, getChannelId, getOrInitiateAccount, indexOffsetOffTicketFromHash, initiateChannel, initiateTicket, oneBigInt, ticketEpochFromHash, ticketIndexFromHash, ticketSecretFromHash, ticketSignatureFromHash, winProbOfTicketFromHash, zeroBD } from './library';

export function handleChannelBalanceDecreased(event: ChannelBalanceDecreased): void {
    let channelId = event.params.channelId.toHex()
    let channel = Channel.load(channelId)

    if (channel == null) {
        log.error("Decrease balance for non-existing channel", [])
        return
    }

    channel.balance = convertEthToDecimal(event.params.newBalance)
    channel.lastUpdatedAt = event.block.timestamp
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
    channel.lastUpdatedAt = event.block.timestamp
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
    channel.lastUpdatedAt = event.block.timestamp
    channel.save()
}

export function handleChannelOpened(event: ChannelOpened): void {
    // source and destination channel
    let sourceId = event.params.source.toHex()
    let destinationId = event.params.destination.toHex()

    let source = getOrInitiateAccount(sourceId)
    let destination = getOrInitiateAccount(destinationId)

    // channelId
    let channelId = getChannelId(event.params.source, event.params.destination).toHex()
    if (Channel.load(channelId) != null) {
        log.error("Channel already exists between source and destination", [])
        return
    }

    let channel = initiateChannel(channelId, sourceId, destinationId)
    channel.lastOpenedAt = event.block.timestamp
    channel.lastUpdatedAt = event.block.timestamp
    channel.status = convertStatusToEnum(1)

    source.fromChannelsCount = source.fromChannelsCount.plus(oneBigInt())

    destination.toChannelsCount = destination.toChannelsCount.plus(oneBigInt())

    source.save()
    destination.save()
    channel.save()
    // TODO: update channel.channelEpoch 
} 


export function handleOutgoingChannelClosureInitiated(event: OutgoingChannelClosureInitiated): void {
    let channelId = event.params.channelId.toHex()
    let channel = Channel.load(channelId)

    if (channel == null) {
        log.error("Initiate outgoing channel closure for non-existing channel", [])
        return
    }

    channel.status = convertStatusToEnum(2)
    channel.lastUpdatedAt = event.block.timestamp
    // TODO: do something with closure time ?
    channel.save()
}

export function handleTicketRedeemed(event: TicketRedeemed): void {
    // get the channel epoch, which is not part of the event
    let channelId = event.params.channelId

    // let ticketEpoch = event.params.ticketEpoch
    let ticketIndex = event.params.newTicketIndex

    // create new ticket
    let ticketId = channelId.toHex() + "-" + ticketIndex.toString()

    let ticket = Ticket.load(ticketId)

    if (ticket == null) {
        log.error("Redeem non-existing ticket", [])
        return
    }
    
    let hashString = event.transaction.input.toString()

    event.transaction.input
    let amount = amountInTicketFromHash(hashString)
    let indexOffset = indexOffsetOffTicketFromHash(hashString)
    let ticketEpoch = ticketEpochFromHash(hashString)
    let winProb = winProbOfTicketFromHash(hashString)
    let signature = ticketSignatureFromHash(hashString)
    let secret = ticketSecretFromHash(hashString)
    
    ticket.amount = convertEthToDecimal(amount)
    ticket.indexOffset = indexOffset
    ticket.winProb = winProb // should be 1/winProb as 0xfffffffff is the denominator ?
    ticket.ticketEpoch = ticketEpoch
    ticket.ticketIndex = ticketIndex
    ticket.proofOfRelaySecret = secret
    ticket.signature = signature
    ticket.redeemedAt = event.block.timestamp

    ticket.save()

    // update channel
    let channel = Channel.load(channelId.toHex())
    if (channel == null) {
        log.error("Redeem a ticket for non-existing channel", [])
        return
    }

    channel.redeemedTicketCount = channel.redeemedTicketCount.plus(oneBigInt())
    channel.ticketEpoch = ticket.ticketEpoch
    channel.ticketIndex = ticket.ticketIndex

    channel.save()
}