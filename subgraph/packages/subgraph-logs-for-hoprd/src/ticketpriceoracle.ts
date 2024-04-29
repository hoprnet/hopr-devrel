import { TicketPriceUpdated } from "../generated/HoprTicketPriceOracle/HoprTicketPriceOracle";
import { Event } from "../generated/schema";
import { fillEvent } from "./utils"


export function handleTicketPriceUpdated(event: TicketPriceUpdated): void {
    let item = new Event(event.transaction.hash.toHex() + event.logIndex.toString())
    item = fillEvent(item, event)
    item.evt_name = "TicketPriceUpdated"

    item.save()
}