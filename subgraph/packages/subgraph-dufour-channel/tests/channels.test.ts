import { ethereum, Address } from "@graphprotocol/graph-ts";
import { ChannelOpened } from "../generated/HoprChannels/HoprChannels";
import { newMockEvent, test, describe, assert, logStore} from "matchstick-as/assembly/index";
import { handleChannelOpened } from "../src/channels";

export function createChannelOpenedEvent(source: string, destination: string): ChannelOpened {
    let event = changetype<ChannelOpened>(newMockEvent())
    event.parameters = new Array()
    
    let sourceParam = new ethereum.EventParam("source", ethereum.Value.fromAddress(Address.fromString(source)))
    let destinationParam = new ethereum.EventParam("destination", ethereum.Value.fromAddress(Address.fromString(destination)))

    event.parameters.push(sourceParam)
    event.parameters.push(destinationParam)

    return event
}

describe("ChannelOpenedEvent", () => {
    test("Open channels generates missing accounts", () => {
        let source = "0x89205a3a3b2a69de6dbf7f01ed13b2108b2c43e7"
        let destination = "0xc0ffee254729296a45a3885639ac7e10f9d54979"
        let event = createChannelOpenedEvent(source, destination)
        
        handleChannelOpened(event)
        
        assert.fieldEquals("Account", source, "fromChannelsCount", "1")
        assert.fieldEquals("Account", destination, "toChannelsCount", "1")
    })   
})