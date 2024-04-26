import { Transfer, Approval } from "../generated/wxHoprToken/ERC20Token";
import { Event } from "../generated/schema";


export function handleWXHoprTokenTransfer(event: Transfer): void {
  let item = new Event(event.transaction.hash.toHex() + event.logIndex.toString())

  item.block_number = event.block.number.toString()
  item.evt_index = event.transaction.toString()
  item.tx_hash = event.transaction.hash.toHex()
  item.evt_name = "Transfer"

  item.save()
}

export function handleWXHoprTokenApproval(event: Approval): void {
  let item = new Event(event.transaction.hash.toHex() + event.logIndex.toString())

  item.block_number = event.block.number.toString()
  item.evt_index = event.transaction.toString()
  item.tx_hash = event.transaction.hash.toHex()
  item.evt_name = "Approval"

  item.save()
}