import { log } from '@graphprotocol/graph-ts'
import { ChannelBalanceDecreased, ChannelBalanceIncreased, ChannelClosed, ChannelOpened, OutgoingChannelClosureInitiated, TicketRedeemed, HoprChannels, RedeemTicketCall } from '../generated/HoprChannels/HoprChannels'
import { Channel, Ticket } from '../generated/schema'
import { convertEthToDecimal, convertStatusToEnum, getChannelId, getOrInitiateAccount, initiateChannel, initiateTicket, oneBigInt, zeroBD } from './library';


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
    channel.status = convertStatusToEnum(2)
    channel.balance = zeroBD()
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

    source.fromChannelsCount = source.fromChannelsCount.plus(oneBigInt())
    source.save()

    destination.toChannelsCount = destination.toChannelsCount.plus(oneBigInt())
    destination.save()

    let channel = initiateChannel(channelId, sourceId, destinationId)
    channel.lastOpenedAt = event.block.timestamp
    channel.save()
}


export function handleOutgoingChannelClosureInitiated(event: OutgoingChannelClosureInitiated): void {
    let channelId = event.params.channelId.toHex()
    let channel = Channel.load(channelId)

    if (channel == null) {
        log.error("Initiate outgoing channel closure for non-existing channel", [])
        return
    }

    channel.status = convertStatusToEnum(2)
}

export function handleTicketRedeemed(event: TicketRedeemed): void {
    // get the channel epoch, which is not part of the event
    let channelId = event.params.channelId

    // let ticketEpoch = event.params.ticketEpoch
    let ticketIndex = event.params.newTicketIndex

    // create new ticket
    let ticketId = channelId.toHex() + "-" + ticketIndex.toString()
    // let ticketId = channelId.toHex() + "-" + channelEpoch.toString() + "-" + ticketEpoch.toString() + "-" + ticketIndex.toString()

    let ticket = Ticket.load(ticketId)

    if (ticket == null) {
        log.error("Redeem non-existing ticket", [])
        return
    }

    ticket.redeemedAt = event.block.timestamp

    // TODO: Missing proofOfRelaySecre
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

export function handleRedeemTicketCall(call: RedeemTicketCall): void {
    let epoch = call.inputs.redeemable.data.epoch
    let winProb = call.inputs.redeemable.data.winProb
    let channelId = call.inputs.redeemable.data.channelId
    let amount = call.inputs.redeemable.data.amount
    let ticketIndex = call.inputs.redeemable.data.ticketIndex
    let signature = call.inputs.redeemable.signature

    let ticketId = channelId.toHex() + "-" + ticketIndex.toString()

    let ticket = initiateTicket(ticketId, channelId.toHex())

    ticket.ticketIndex = ticketIndex
    ticket.ticketEpoch = epoch
    ticket.amount = convertEthToDecimal(amount)
    ticket.winProb = winProb
    ticket.signature = signature.vs

    ticket.save()
}