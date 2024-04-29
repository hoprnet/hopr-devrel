import { DergisteredNodeSafe, DomainSeparatorUpdated, RegisteredNodeSafe } from "../generated/HoprNodeSafeRegistry/HoprNodeSafeRegistry";
import { Event } from "../generated/schema";
import { fillEvent } from "./utils"


export function handleDergisteredNodeSafe(event: DergisteredNodeSafe): void {
    let item = new Event(event.transaction.hash.toHex() + event.logIndex.toString())
    item = fillEvent(item, event)
    item.evt_name = "DergisteredNodeSafe"

    item.save()
}

export function handleDomainSeparatorUpdated(event: DomainSeparatorUpdated): void {
    let item = new Event(event.transaction.hash.toHex() + event.logIndex.toString())
    item = fillEvent(item, event)
    item.evt_name = "DomainSeparatorUpdatedSafeRegistry"

    item.save()
}

export function handleRegisteredNodeSafe(event: RegisteredNodeSafe): void {
    let item = new Event(event.transaction.hash.toHex() + event.logIndex.toString())
    item = fillEvent(item, event)
    item.evt_name = "RegisteredNodeSafe"

    item.save()
}

