import { newMockEvent } from "matchstick-as"
import { ethereum, Address } from "@graphprotocol/graph-ts"
import {
  DergisteredNodeSafe,
  RegisteredNodeSafe
} from "../generated/NodeSafeRegistry/NodeSafeRegistry"

export function createDergisteredNodeSafeEvent(
  safeAddress: Address,
  nodeAddress: Address
): DergisteredNodeSafe {
  let dergisteredNodeSafeEvent = changetype<DergisteredNodeSafe>(newMockEvent())

  dergisteredNodeSafeEvent.parameters = new Array()

  dergisteredNodeSafeEvent.parameters.push(
    new ethereum.EventParam(
      "safeAddress",
      ethereum.Value.fromAddress(safeAddress)
    )
  )
  dergisteredNodeSafeEvent.parameters.push(
    new ethereum.EventParam(
      "nodeAddress",
      ethereum.Value.fromAddress(nodeAddress)
    )
  )

  return dergisteredNodeSafeEvent
}

export function createRegisteredNodeSafeEvent(
  safeAddress: Address,
  nodeAddress: Address
): RegisteredNodeSafe {
  let registeredNodeSafeEvent = changetype<RegisteredNodeSafe>(newMockEvent())

  registeredNodeSafeEvent.parameters = new Array()

  registeredNodeSafeEvent.parameters.push(
    new ethereum.EventParam(
      "safeAddress",
      ethereum.Value.fromAddress(safeAddress)
    )
  )
  registeredNodeSafeEvent.parameters.push(
    new ethereum.EventParam(
      "nodeAddress",
      ethereum.Value.fromAddress(nodeAddress)
    )
  )

  return registeredNodeSafeEvent
}
