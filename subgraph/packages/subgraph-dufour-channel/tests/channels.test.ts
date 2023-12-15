import { test, describe, assert, beforeAll, clearStore, beforeEach, afterEach} from "matchstick-as/assembly/index";
import { handleChannelOpened, handleOutgoingChannelClosureInitiated } from "../src/channels";
import { createChannelOpenedEvent, createOutgoingChannelClosureInitiatedEvent } from "./channels.utils";
import { initiateChannel } from "../src/library";
import { channelId } from "./utils";

let source = "0x89205a3a3b2a69de6dbf7f01ed13b2108b2c43e7"
let destination = "0xc0ffee254729296a45a3885639ac7e10f9d54979"

describe("ChannelBalanceDecreased", () => {
    test("", () => {

    })
})

describe("ChannelBalanceIncreased", () => {
    test("", () => {

    })
})

describe("ChannelClosed", () => {
    test("", () => {

    })
})

describe("ChannelOpenedEvent", () => {
    beforeEach(() => {
        let event = createChannelOpenedEvent(source, destination)
        handleChannelOpened(event)
    })

    afterEach(() => {
        clearStore()
    })
      
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
        channel.save()
    })

    test("CloseChannel sets status", () => {
        let id = channelId(source, destination)

        let event = createOutgoingChannelClosureInitiatedEvent(id, 300)
        handleOutgoingChannelClosureInitiated(event)

        assert.fieldEquals("Channel", id, "source", source)
        assert.fieldEquals("Channel", id, "destination", destination)
        assert.fieldEquals("Channel", id, "status", "PENDING_TO_CLOSE")
    })
})

describe("TicketRedeemed", () => {
    test("", () => {

    })
})
