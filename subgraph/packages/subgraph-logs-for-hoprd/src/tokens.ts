import { Transfer, Approval } from "../generated/wxHoprToken/ERC20Token";
import { Event } from "../generated/schema";
import { fillEvent } from "./utils"

export function handleTokenTransfer(event: Transfer): void {
  let item = new Event(event.transaction.hash.toHex() + event.logIndex.toString())
  item = fillEvent(item, event)
  item.evt_name = "Transfer"

  item.save()
}

export function handleTokenApproval(event: Approval): void {
  let item = new Event(event.transaction.hash.toHex() + event.logIndex.toString())
  item = fillEvent(item, event)
  item.evt_name = "Approval"

  item.save()
}