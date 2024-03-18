import { BigDecimal, log } from '@graphprotocol/graph-ts'
import { ChannelBalanceDecreased, ChannelBalanceIncreased, ChannelClosed, ChannelOpened, OutgoingChannelClosureInitiated, TicketRedeemed } from '../generated/HoprChannels/HoprChannels'
import { Channel, Ticket } from '../generated/schema'
import { amountInTicketFromHash, convertEthToDecimal, convertStatusToEnum, getChannelId, getOrInitiateAccount, indexOffsetFromHash, initiateChannel, initiateTicket, oneBigInt, ticketEpochFromHash, ticketSecretFromHash, ticketSignatureFromHash, winProbFromHash } from './library';

export function handleChannelBalanceDecreased(event: ChannelBalanceDecreased): void {
    let channelId = event.params.channelId.toHex()
    let new_balance = convertEthToDecimal(event.params.newBalance)
    let channel = Channel.load(channelId)

    if (channel == null) {
        log.error("Decrease balance for non-existing channel", [])
        return
    }

    if (new_balance > channel.balance) {
        log.error("Decrease balance for channel above current balance", [])
        return
    }
    let diff = channel.balance.minus(new_balance)

    channel.balance = convertEthToDecimal(event.params.newBalance)
    channel.lastUpdatedAt = event.block.timestamp
    channel.save()

    let account = getOrInitiateAccount(channel.source)
    account.balance = account.balance.minus(diff)
    account.save()
}

export function handleChannelBalanceIncreased(event: ChannelBalanceIncreased): void {
    let channelId = event.params.channelId.toHex()
    let new_balance = convertEthToDecimal(event.params.newBalance)
    let channel = Channel.load(channelId)

    if (channel == null) {
        log.error("Increase balance for non-existing channel", [])
        return
    }

    if (new_balance < channel.balance) {
        log.error("Increase balance for channel below current balance", [])
        return
    }

    let diff = new_balance.minus(channel.balance)
    let account = getOrInitiateAccount(channel.source)
    account.balance = account.balance.plus(diff)
    account.save()

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

    if (channel.status != convertStatusToEnum(2)) {
        log.error("Closing non-pendingToClose channel", [])
        return
    }

    let source = getOrInitiateAccount(channel.source)
    source.fromChannelsCount = source.fromChannelsCount.minus(oneBigInt())
    source.balance = source.balance.minus(channel.balance)
    source.save()

    let destination = getOrInitiateAccount(channel.destination)
    destination.toChannelsCount = destination.toChannelsCount.minus(oneBigInt())
    destination.save()

    channel.lastClosedAt = event.block.timestamp
    channel.lastUpdatedAt = event.block.timestamp
    channel.status = convertStatusToEnum(0)
    channel.balance = BigDecimal.fromString("0")
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

    if (channel.status != convertStatusToEnum(1)) {
        log.error("Initiate outgoing channel closure for non-open channel", [])
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

    // update channel
    let channel = Channel.load(channelId.toHex())
    if (channel == null) {
        log.error("Redeem a ticket for non-existing channel", [])
        return
    }

    let ticketIndex = event.params.newTicketIndex

    // create new ticket
    let ticketId = channelId.toHex() + "-" + ticketIndex.toString()
    let ticket = initiateTicket(ticketId, channelId.toHex())
    let hashString = event.transaction.input.toHexString()

    ticket.amount = convertEthToDecimal(amountInTicketFromHash(hashString))
    ticket.indexOffset = indexOffsetFromHash(hashString)
    ticket.winProb = winProbFromHash(hashString) // should be 1/winProb as 0xfffffffff is the denominator ?
    ticket.ticketEpoch = ticketEpochFromHash(hashString)
    ticket.ticketIndex = ticketIndex
    ticket.proofOfRelaySecret = ticketSecretFromHash(hashString)
    ticket.signature = ticketSignatureFromHash(hashString)
    ticket.redeemedAt = event.block.timestamp

    ticket.save()

    channel.redeemedTicketCount = channel.redeemedTicketCount.plus(oneBigInt())
    channel.ticketEpoch = ticket.ticketEpoch
    channel.ticketIndex = ticket.ticketIndex

    channel.save()

    // update account redeemedValue
    let account = getOrInitiateAccount(channel.destination)
    account.redeemedValue = account.redeemedValue.plus(ticket.amount)

    account.save()
}