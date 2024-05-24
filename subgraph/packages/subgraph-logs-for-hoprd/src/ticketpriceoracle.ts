import { TicketPriceUpdated } from "../generated/HoprTicketPriceOracle/HoprTicketPriceOracle";
import { newEvent } from "./utils"


export function handleTicketPriceUpdated(event: TicketPriceUpdated): void {
    let item = newEvent(event)
    item.evt_name = "TicketPriceUpdated"

    item.save()
}