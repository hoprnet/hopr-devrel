import { Address } from "@graphprotocol/graph-ts";
import { getChannelId } from "../src/library";

function addressFromString(input: string): Address {
    return changetype<Address>(Address.fromHexString(input))
}

export function channelId(source: string, destination: string): string {
    return getChannelId(addressFromString(source), addressFromString(destination)).toHex()
}
