import { ethereum, Address, Bytes, BigInt } from "@graphprotocol/graph-ts";
import { ChannelBalanceDecreased, ChannelBalanceIncreased, ChannelClosed, ChannelOpened, OutgoingChannelClosureInitiated, TicketRedeemed } from "../generated/HoprChannels/HoprChannels";
import { newMockEvent } from "matchstick-as/assembly/index";


export function createChannelBalanceDecreasedEvent(id: string, newBalance: i32): ChannelBalanceDecreased {
    let event = changetype<ChannelBalanceDecreased>(newMockEvent())
    event.parameters = new Array()

    let idBytes = Bytes.fromHexString(id)
    let channelIdParam = new ethereum.EventParam("channelId", ethereum.Value.fromBytes(idBytes))
    let newBalanceParam = new ethereum.EventParam("newBalance", ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(newBalance)))

    event.parameters.push(channelIdParam)
    event.parameters.push(newBalanceParam)

    return event
}


export function createChannelBalanceIncreasedEvent(id: string, newBalance: i32): ChannelBalanceIncreased {
    let event = changetype<ChannelBalanceIncreased>(newMockEvent())
    event.parameters = new Array()

    let idBytes = Bytes.fromHexString(id)
    let channelIdParam = new ethereum.EventParam("channelId", ethereum.Value.fromBytes(idBytes))
    let newBalanceParam = new ethereum.EventParam("newBalance", ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(newBalance)))

    event.parameters.push(channelIdParam)
    event.parameters.push(newBalanceParam)

    return event
}


export function createChannelClosedEvent(id: string): ChannelClosed {
    let event = changetype<ChannelClosed>(newMockEvent())
    event.parameters = new Array()

    let idBytes = Bytes.fromHexString(id)
    let channelIdParam = new ethereum.EventParam("channelId", ethereum.Value.fromBytes(idBytes))

    event.parameters.push(channelIdParam)

    return event
}


export function createChannelOpenedEvent(source: string, destination: string): ChannelOpened {
    let event = changetype<ChannelOpened>(newMockEvent())
    event.parameters = new Array()

    let sourceParam = new ethereum.EventParam("source", ethereum.Value.fromAddress(Address.fromString(source)))
    let destinationParam = new ethereum.EventParam("destination", ethereum.Value.fromAddress(Address.fromString(destination)))

    event.parameters.push(sourceParam)
    event.parameters.push(destinationParam)

    return event
}


export function createOutgoingChannelClosureInitiatedEvent(id: string, closureTime: i32): OutgoingChannelClosureInitiated {
    let event = changetype<OutgoingChannelClosureInitiated>(newMockEvent())
    event.parameters = new Array()

    let idBytes = Bytes.fromHexString(id)
    let channelIdParam = new ethereum.EventParam("channelId", ethereum.Value.fromBytes(idBytes))
    let closureTimeParam = new ethereum.EventParam("closureTime", ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(closureTime)))

    event.parameters.push(channelIdParam)
    event.parameters.push(closureTimeParam)

    return event
}



export function createTicketRedeemedEvent(id: string, newTicketIndex: i32, input: string): TicketRedeemed {
    let event = changetype<TicketRedeemed>(newMockEvent())
    event.parameters = new Array()

    let idBytes = Bytes.fromHexString(id)
    let channelIdParam = new ethereum.EventParam("channelId", ethereum.Value.fromBytes(idBytes))
    let newTicketIndexParam = new ethereum.EventParam("newTicketIndex", ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(newTicketIndex)))

    event.parameters.push(channelIdParam)
    event.parameters.push(newTicketIndexParam)

    event.transaction.input = Bytes.fromHexString(input)

    return event
}