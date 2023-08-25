import { store } from "@graphprotocol/graph-ts";
import { AddedOwner, ChangedThreshold, RemovedOwner, SafeSetup } from "../generated/templates/Safe/Safe";
import { getOrInitializeSafe, getOrInitializeSafeOwnerPair } from "./helper";

export function handleSafeSetup(event: SafeSetup): void {
    // get the safe instance
    let safe = getOrInitializeSafe(event.address, event.block.number)
    safe.threshold = event.params.threshold
    safe.isCreatedByNodeStakeFactory = true
    safe.save()
    
    let owners = event.params.owners
    for (let i = 0; i < owners.length; i++) {
      let safeOwnerPair = getOrInitializeSafeOwnerPair(event.address, owners[i].toHex(), event.block.number)
      safeOwnerPair.save()
    }
}

export function handleAddOwner(event: AddedOwner): void {
    let safeOwnerPair = getOrInitializeSafeOwnerPair(event.address, event.params.owner.toHex(), event.block.number)
    safeOwnerPair.save()
}

export function handleRemoveOwner(event: RemovedOwner): void {
    let key = event.address.toHex() + "-" + event.params.owner.toHex();
    // remove the SafeOwnerPair entity
    store.remove('SafeOwnerPair', key);
}

export function handleChangeThreshold(event: ChangedThreshold): void {
    // get the safe instance
    let safe = getOrInitializeSafe(event.address, event.block.number)
    safe.threshold = event.params.threshold
    safe.save()
}