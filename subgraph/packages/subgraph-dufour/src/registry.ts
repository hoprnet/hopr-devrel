import { store } from "@graphprotocol/graph-ts";
import { DergisteredNodeSafe, RegisteredNodeSafe } from "../generated/NodeSafeRegistry/NodeSafeRegistry"
import { Deregistered, DeregisteredByManager, EligibilityUpdated, Registered, RegisteredByManager } from "../generated/NetworkRegistry/NetworkRegistry"
import { getOrInitializeNetworkRegistration, getOrInitializeNodeSafeRegistration, getOrInitializeSafe } from "./helper";

export function handleRegisteredNodeSafe(event: RegisteredNodeSafe): void {
  let nodeSafeRegistration = getOrInitializeNodeSafeRegistration(event.params.safeAddress, event.params.nodeAddress.toHex(), event.block.number);
  nodeSafeRegistration.save()
}

export function handleDergisteredNodeSafe(event: DergisteredNodeSafe): void {
  let key = event.params.safeAddress.toHex() + "-" + event.params.nodeAddress.toHex();
  // remove the NodeSafeRegistration entity
  store.remove('NodeSafeRegistration', key);
}

export function handleRegisterNetworkRegistry(event: Registered): void {
  let nodeNetworkRegistration = getOrInitializeNetworkRegistration(event.params.stakingAccount, event.params.nodeAddress.toHex(), event.block.number);
  nodeNetworkRegistration.save()
}

export function handleDeregisterNetworkRegistry(event: Deregistered): void {
  let key = event.params.stakingAccount.toHex() + "-" + event.params.nodeAddress.toHex();
  // remove the NetworkRegistration entity
  store.remove('NetworkRegistration', key);
}

export function handleRegisterByManangerNetworkRegistry(event: RegisteredByManager): void {
  let nodeNetworkRegistration = getOrInitializeNetworkRegistration(event.params.stakingAccount, event.params.nodeAddress.toHex(), event.block.number);
  nodeNetworkRegistration.save()
}

export function handleDeregisterByManangerNetworkRegistry(event: DeregisteredByManager): void {
  let key = event.params.stakingAccount.toHex() + "-" + event.params.nodeAddress.toHex();
  // remove the NetworkRegistration entity
  store.remove('NetworkRegistration', key);
}

export function handleUpdateEligibility(event: EligibilityUpdated): void {
  // get the safe instance
  let safe = getOrInitializeSafe(event.params.stakingAccount, event.block.number)
  safe.isEligibleOnNetworkRegistry = event.params.eligibility
  safe.save()
}






