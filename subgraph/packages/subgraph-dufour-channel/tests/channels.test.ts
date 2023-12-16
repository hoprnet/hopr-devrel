import { test, describe, assert, clearStore, beforeEach, afterEach } from "matchstick-as/assembly/index";
import { handleChannelBalanceDecreased, handleChannelBalanceIncreased, handleChannelClosed, handleChannelOpened, handleOutgoingChannelClosureInitiated, handleTicketRedeemed } from "../src/channels";
import { createChannelBalanceDecreasedEvent, createChannelBalanceIncreasedEvent, createChannelClosedEvent, createChannelOpenedEvent, createOutgoingChannelClosureInitiatedEvent, createTicketRedeemedEvent } from "./channels.utils";
import { amountInTicketFromHash, convertEthToDecimal, convertStatusToEnum, indexOffsetFromHash, initiateChannel, ticketEpochFromHash, ticketSecretFromHash, ticketSignatureFromHash, winProbFromHash } from "../src/library";
import { channelId } from "./utils";
import { Channel } from "../generated/schema";

export { handleChannelBalanceDecreased, handleChannelBalanceIncreased, handleChannelClosed, handleChannelOpened, handleOutgoingChannelClosureInitiated, handleTicketRedeemed }



let source = "0x89205a3a3b2a69de6dbf7f01ed13b2108b2c43e7"
let destination = "0xc0ffee254729296a45a3885639ac7e10f9d54979"

describe("ChannelBalanceDecreased", () => {
    beforeEach(() => {
        let channel = initiateChannel(channelId(source, destination), source, destination)
        channel.status = convertStatusToEnum(2)
        channel.save()
    })

    afterEach(clearStore)

    test("DecreaseChannelBalance changes the channel's balance", () => {
        let id = channelId(source, destination)

        let event = createChannelBalanceDecreasedEvent(id, 10 as i32)
        handleChannelBalanceDecreased(event)

        let newBalance = Channel.load(id)!.balance

        assert.stringEquals(newBalance.toString(), "0.00000000000000001")
    })
})

describe("ChannelBalanceIncreased", () => {
    beforeEach(() => {
        let channel = initiateChannel(channelId(source, destination), source, destination)
        channel.status = convertStatusToEnum(2)
        channel.save()
    })

    afterEach(clearStore)

    test("IncreaseChannelBalance changes the channel's balance", () => {
        let id = channelId(source, destination)

        let event = createChannelBalanceIncreasedEvent(id, 10 as i32)
        handleChannelBalanceIncreased(event)

        let newBalance = Channel.load(id)!.balance

        assert.stringEquals(newBalance.toString(), "0.00000000000000001")
    })
})

describe("ChannelClosed", () => {
    beforeEach(() => {
        let channel = initiateChannel(channelId(source, destination), source, destination)
        channel.status = convertStatusToEnum(2)
        channel.save()
    })

    afterEach(clearStore)

    test("CloseChannel closes pendingToClose channels", () => {
        let id = channelId(source, destination)
        let event = createChannelClosedEvent(id)

        handleChannelClosed(event)

        assert.fieldEquals("Channel", id, "status", "CLOSED")
    })

    test("CloseChannel closes don't close non-pendingToClose channels", () => {
        let id = channelId(source, destination)

        let channel = Channel.load(id)!
        channel.status = convertStatusToEnum(1)
        channel.save()

        let event = createChannelClosedEvent(id)

        handleChannelClosed(event)

        assert.fieldEquals("Channel", id, "status", "OPEN")
    })

    test("CloseChannel reduces accounts' channel counts", () => {
        clearStore()
        handleChannelOpened(createChannelOpenedEvent(source, destination))
        let id = channelId(source, destination)

        let channel = Channel.load(id)!
        channel.status = convertStatusToEnum(2)
        channel.save()

        assert.fieldEquals("Account", source, "fromChannelsCount", "1")
        assert.fieldEquals("Account", destination, "toChannelsCount", "1")

        handleChannelClosed(createChannelClosedEvent(id))

        assert.fieldEquals("Account", source, "fromChannelsCount", "0")
        assert.fieldEquals("Account", destination, "toChannelsCount", "0")
    })
})

describe("ChannelOpenedEvent", () => {
    beforeEach(() => {
        let event = createChannelOpenedEvent(source, destination)
        handleChannelOpened(event)
    })

    afterEach(clearStore)

    test("OpenChannel generates two accounts", () => {
        assert.entityCount("Account", 2)
        assert.fieldEquals("Account", source, "fromChannelsCount", "1")
        assert.fieldEquals("Account", destination, "toChannelsCount", "1")
    })

    test("OpenChannel generates only missing accounts", () => {
        let destination_2 = "0x254729296a45a3885639ac7c0ffeee10f9d54979"

        let event = createChannelOpenedEvent(source, destination_2)
        handleChannelOpened(event)

        assert.entityCount("Account", 3)
        assert.fieldEquals("Account", source, "fromChannelsCount", "2")
        assert.fieldEquals("Account", destination, "toChannelsCount", "1")
        assert.fieldEquals("Account", destination_2, "toChannelsCount", "1")
    })


    test("OpenChannel stores a new channel", () => {
        assert.notInStore("Channel", channelId(source, destination), "Channel stored")
    }, true)

    test("OpenChannel sets timestamp", () => {
        assert.fieldEquals("Channel", channelId(source, destination), "lastOpenedAt", "None", "lastOpenedAt set")
    }, true)

    test("OpenChannel sets status", () => {
        assert.fieldEquals("Channel", channelId(source, destination), "status", "OPEN")
    })
})

describe("OutgoingChannelClosureInitiated", () => {
    beforeEach(() => {
        let channel = initiateChannel(channelId(source, destination), source, destination)
        channel.status = convertStatusToEnum(1)
        channel.save()
    })

    afterEach(clearStore)

    test("CloseChannel sets status", () => {
        let id = channelId(source, destination)

        let event = createOutgoingChannelClosureInitiatedEvent(id, 300)
        handleOutgoingChannelClosureInitiated(event)

        assert.fieldEquals("Channel", id, "source", source)
        assert.fieldEquals("Channel", id, "destination", destination)
        assert.fieldEquals("Channel", id, "status", "PENDING_TO_CLOSE")
    })

    test("CloseChannel can't close pendingToClose channel", () => {
        let id = channelId(source, destination)

        let event = createOutgoingChannelClosureInitiatedEvent(id, 300)
        handleOutgoingChannelClosureInitiated(event)

        let lastUpdatedAt = Channel.load(id)!.lastUpdatedAt

        handleOutgoingChannelClosureInitiated(event)

        assert.assertTrue(Channel.load(id)!.lastUpdatedAt == lastUpdatedAt)
    })
})

describe("TicketRedeemed", () => {
    beforeEach(() => {
        let channel = initiateChannel(channelId(source, destination), source, destination)
        channel.status = convertStatusToEnum(1)
        channel.save()
    })

    test("Ticket params parsed from hash", () => {
        let id = channelId(source, destination)
        let ticketIndex = 10
        let ticketId = id + "-" + ticketIndex.toString()
        let input = "0x468721a7000000000000000000000000693bac5ce61c720ddc68533991ceb41199d8f8ae00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002440cd88d7200000000000000000000000019a78417065c3054edca3c4b9c02f127a6c2a0ec108cbd4158f5d3c864e67cef315a14e80b5dc711f863fac556c83a03d567367f0000000000000000000000000000000000000000000000008c2a687ce772000000000000000000000000000000000000000000000000000000000000000013a200000000000000000000000000000000000000000000000000000000000000ee000000000000000000000000000000000000000000000000000000000000000300000000000000000000000000000000000000000000000000ffffffffffffff54f0a2d47128af13ae07c22541b2b518b83daac2fba1613fb3dfadcb74c78064f41282c1256bfd3c2ebe3983b4f47b5f0db5ab758fed3c28020f2fd54744dcb9d867996a6cd7aa47ff1aa63d8bc361dac071203b10b35bc42fddd02f4ef75ac610d41749c2ccb9c90ed5962a774c9a183d6e3b5d1cc89c660917500a822ea8200381a32780b1abe1510c22116fac8d36e8041c4e1ea53b21d28e0c64db8e5257f7ed30938344eadebb404285a5456201311fcce02d187895a95eb459450076dbaf1dda3315509027b014efe13c88ec85b682e53e67ad13d8cdefac6de2d18a2ce15d26f64c101b86a7ba89e99080256c916d16aae43dfc7105050a816a556d5a426ada72ff0c5a150ef3fee51be0ce67b05e785332c5cbf65113019bc4a5a589eea4be179d6a2000fcabe43eb6db28739d1d648b62269634c5608a6a6ea6ed7bb4ba2e8c6504e9f4a193091b43248cf3d2442c32b442efd12e15dfe3a11bbcf600000000000000000000000000000000000000000000000000000000"

        let event = createTicketRedeemedEvent(id, ticketIndex as i32, input)

        handleTicketRedeemed(event)

        assert.entityCount("Ticket", 1)
        assert.fieldEquals("Ticket", ticketId, "indexOffset", "238")
        assert.fieldEquals("Ticket", ticketId, "ticketEpoch", "3")
        assert.fieldEquals("Ticket", ticketId, "amount", "10.1")
        assert.fieldEquals("Ticket", ticketId, "ticketIndex", ticketIndex.toString())
        assert.fieldEquals("Channel", id, "redeemedTicketCount", "1")
        assert.fieldEquals("Channel", id, "ticketEpoch", "3")
        assert.fieldEquals("Channel", id, "ticketIndex", ticketIndex.toString())
    })

    test("Decode", () => {
        let input = "0x468721a7000000000000000000000000693bac5ce61c720ddc68533991ceb41199d8f8ae00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002440cd88d720000000000000000000000000cdf2b1dc32a1c663eae92b358d01cd01ea76c6c0e03f8d32c477f7dabd0fee44fde5bbf83070524258fdfe0713002bf824ed0da0000000000000000000000000000000000000000000000008c2a687ce772000000000000000000000000000000000000000000000000000000000000000005020000000000000000000000000000000000000000000000000000000000000085000000000000000000000000000000000000000000000000000000000000000300000000000000000000000000000000000000000000000000ffffffffffffff89b9b6427262b08853fd316c3b67e66da956df110156bd0fa049b31303a40a895ec884c6cdfec68dfddd2e6744e79c5263f4395cae33f8f38f948ff254a1cc805120b0f3ec1350771ca8f77a7dfe487d86fcc6afd5fd07fbb4af0f7b8fad2e4db0472eb8777580497d48f3a1f9ea1e780393aa853680e7c7d83d11c9272393d130f2a17b63e3a98a0469be623b899066bc8c633b1429735286aa1fb2f6aaf14bd7f72c92d8b5620104114e0f15a89deacda029c3f77f48d07aa12346099c13b2d09d444bd71a5c8a1f2e9281ea9e632f7c2b30b5d4a42e74d8750e7cafb6cde893e73dbb8a30c69bc2defa67ea16787e4f6f2dc646e94cb0369354729ad3618166d276ccd5cdaf1cd9fc7e5571a5792b7922aa8fb8162e35a86a629b2a18eb4d3ee727784d9cce660d6e0cebea1184c9d431223e3a1caa21fda4ab64b0afae240868cfe6e87f8fceda1286dd36ae1db715521061ff026dc0792e657ece0f610900000000000000000000000000000000000000000000000000000000"

        let amount = convertEthToDecimal(amountInTicketFromHash(input))
        let indexOffset = indexOffsetFromHash(input)
        let winProb = winProbFromHash(input) // should be 1/winProb as 0xfffffffff is the denominator ?
        let ticketEpoch = ticketEpochFromHash(input)
        let proofOfRelaySecret = ticketSecretFromHash(input)
        let signature = ticketSignatureFromHash(input)
    })
})
