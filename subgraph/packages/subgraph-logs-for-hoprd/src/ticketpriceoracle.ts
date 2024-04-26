import { TicketPriceUpdated } from "../generated/HoprTicketPriceOracle/HoprTicketPriceOracle";
import { Event } from "../generated/schema";


export function handleTicketPriceUpdated(event: TicketPriceUpdated): void {
    let item = new Event(event.transaction.hash.toHex() + event.logIndex.toString())

    item.block_number = event.block.number.toString()
    item.evt_index = event.transaction.toString()
    item.tx_hash = event.transaction.hash.toHex()
    item.evt_name = "TicketPriceUpdated"

    item.save()
}