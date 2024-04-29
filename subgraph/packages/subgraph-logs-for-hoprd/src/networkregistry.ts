import { Deregistered, DeregisteredByManager, EligibilityUpdated, NetworkRegistryStatusUpdated, Registered, RegisteredByManager, RequirementUpdated } from "../generated/HoprNetworkRegistry/HoprNetworkRegistry";
import { Event } from "../generated/schema";
import { fillEvent } from "./utils"


export function handleDergistered(event: Deregistered): void {
    let item = new Event(event.transaction.hash.toHex() + event.logIndex.toString())
    item = fillEvent(item, event)
    item.evt_name = "Deregistered"

    item.save()
}

export function handleDeregisteredByManager(event: DeregisteredByManager): void {
    let item = new Event(event.transaction.hash.toHex() + event.logIndex.toString())
    item = fillEvent(item, event)
    item.evt_name = "DeregisteredByManager"

    item.save()
}

export function handleEligibilityUpdated(event: EligibilityUpdated): void {
    let item = new Event(event.transaction.hash.toHex() + event.logIndex.toString())
    item = fillEvent(item, event)
    item.evt_name = "EligibilityUpdated"

    item.save()
}


export function handleNetworkRegistryStatusUpdated(event: NetworkRegistryStatusUpdated): void {
    let item = new Event(event.transaction.hash.toHex() + event.logIndex.toString())
    item = fillEvent(item, event)
    item.evt_name = "NetworkRegistryStatusUpdated"

    item.save()
}


export function handleRegistered(event: Registered): void {
    let item = new Event(event.transaction.hash.toHex() + event.logIndex.toString())
    item = fillEvent(item, event)
    item.evt_name = "Registered"

    item.save()
}


export function handleRegisteredByManager(event: RegisteredByManager): void {
    let item = new Event(event.transaction.hash.toHex() + event.logIndex.toString())
    item = fillEvent(item, event)
    item.evt_name = "RegisteredByManager"

    item.save()
}


export function handleRequirementUpdated(event: RequirementUpdated): void {
    let item = new Event(event.transaction.hash.toHex() + event.logIndex.toString())
    item = fillEvent(item, event)
    item.evt_name = "RequirementUpdated"

    item.save()
}

