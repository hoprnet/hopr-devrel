import {
  Transfer as XHoprTransferEvent,
} from "../generated/PermittableToken/PermittableToken"
import {
  Transfer as WXHoprTransferEvent,
} from "../generated/HoprToken/HoprToken"
import { ADDRESS_ZERO, updateWXHoprAccount, updateXHoprAccount } from "./library"

export function handleXHoprTransfer(event: XHoprTransferEvent): void {
  let addrFrom = event.params.from
  let addrTo = event.params.to
  let blkNum = event.block.number
  let blkTimeStamp = event.block.timestamp

  if (addrFrom.toHex() != ADDRESS_ZERO) {
    updateXHoprAccount(addrFrom, event.params.value, false, blkNum, blkTimeStamp)
  }
  if (addrTo.toHex() != ADDRESS_ZERO) {
    updateXHoprAccount(addrTo, event.params.value, true, blkNum, blkTimeStamp)
  }
}

export function handleWXHoprTransfer(event: WXHoprTransferEvent): void {
  let addrFrom = event.params.from
  let addrTo = event.params.to
  let blkNum = event.block.number
  let blkTimeStamp = event.block.timestamp

  if (addrFrom.toHex() != ADDRESS_ZERO) {
    updateWXHoprAccount(addrFrom, event.params.value, false, blkNum, blkTimeStamp)
  }
  if (addrTo.toHex() != ADDRESS_ZERO) {
    updateWXHoprAccount(addrTo, event.params.value, true, blkNum, blkTimeStamp)
  }
}

