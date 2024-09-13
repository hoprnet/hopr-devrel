import {
  Transfer as HoprTransferEvent,
} from "../generated/HoprToken/HoprToken"
import { ADDRESS_ZERO, updateHoprAccount } from "./library"


export function handleTransfert(event: HoprTransferEvent): void {
  let addrFrom = event.params.from
  let addrTo = event.params.to
  let blkNum = event.block.number
  let blkTimeStamp = event.block.timestamp

  if (addrFrom.toHex() != ADDRESS_ZERO) {
    updateHoprAccount(addrFrom, event.params.value, false, blkNum, blkTimeStamp)
  }
  if (addrTo.toHex() != ADDRESS_ZERO) {
    updateHoprAccount(addrTo, event.params.value, true, blkNum, blkTimeStamp)
  }
}