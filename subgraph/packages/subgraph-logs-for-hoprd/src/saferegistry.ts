import { DergisteredNodeSafe, DomainSeparatorUpdated, RegisteredNodeSafe } from "../generated/HoprNodeSafeRegistry/HoprNodeSafeRegistry";
import { newEvent } from "./utils"


export function handleDergisteredNodeSafe(event: DergisteredNodeSafe): void {
    let item = newEvent(event)
    item.evt_name = "DergisteredNodeSafe"

    item.save()
}

export function handleDomainSeparatorUpdated(event: DomainSeparatorUpdated): void {
    let item = newEvent(event)
    item.evt_name = "DomainSeparatorUpdatedSafeRegistry"

    item.save()
}

export function handleRegisteredNodeSafe(event: RegisteredNodeSafe): void {
    let item = newEvent(event)
    item.evt_name = "RegisteredNodeSafe"

    item.save()
}

