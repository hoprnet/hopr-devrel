import { Transfer, Approval } from "../generated/wxHoprToken/ERC20Token";
import { newEvent } from "./utils"

export function handleTokenTransfer(event: Transfer): void {
  let item = newEvent(event)
  item.evt_name = "Transfer"

  item.save()
}

export function handleTokenApproval(event: Approval): void {
  let item = newEvent(event)
  item.evt_name = "Approval"

  item.save()
}