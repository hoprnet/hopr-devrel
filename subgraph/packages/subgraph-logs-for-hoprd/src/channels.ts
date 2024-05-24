import { ChannelBalanceDecreased, ChannelBalanceIncreased, ChannelClosed, ChannelOpened, OutgoingChannelClosureInitiated, TicketRedeemed, DomainSeparatorUpdated, LedgerDomainSeparatorUpdated } from "../generated/HoprChannels/HoprChannels";
import { newEvent } from "./utils"

export function handleChannelBalanceDecreased(event: ChannelBalanceDecreased): void {
    let item = newEvent(event)
    item.evt_name = "ChannelBalanceDecreased"

    item.save()
}

export function handleChannelBalanceIncreased(event: ChannelBalanceIncreased): void {
    let item = newEvent(event)
    item.evt_name = "ChannelBalanceIncreased"

    item.save()
}

export function handleChannelClosed(event: ChannelClosed): void {
    let item = newEvent(event)
    item.evt_name = "ChannelClosed"

    item.save()
}

export function handleChannelOpened(event: ChannelOpened): void {
    let item = newEvent(event)
    item.evt_name = "ChannelOpened"

    item.save()
}

export function handleOutgoingChannelClosureInitiated(event: OutgoingChannelClosureInitiated): void {
    let item = newEvent(event)
    item.evt_name = "OutgoingChannelClosureInitiated"

    item.save()
}

export function handleTicketRedeemed(event: TicketRedeemed): void {
    let item = newEvent(event)
    item.evt_name = "TicketRedeemed"

    item.save()
}

export function handleDomainSeparatorUpdated(event: DomainSeparatorUpdated): void {
    let item = newEvent(event)
    item.evt_name = "DomainSeparatorUpdatedChannel"

    item.save()
}

export function handleLedgerDomainSeparatorUpdated(event: LedgerDomainSeparatorUpdated): void {
    let item = newEvent(event)
    item.evt_name = "LedgerDomainSeparatorUpdated"

    item.save()
}