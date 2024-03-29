import { store, log } from "@graphprotocol/graph-ts";
import { AddedOwner, ChangedThreshold, DisabledModule, EnabledModule, RemovedOwner, SafeSetup } from "../generated/templates/Safe/Safe";
import { getOrInitializeSafe, getOrInitializeSafeModulePair, getOrInitializeSafeOwnerPair, increaseBalancesTrackerForSafes } from "./helper";
import { Balance } from "../generated/schema";
import { TokenType } from "./types";

export function handleSafeSetup(event: SafeSetup): void {
    // get the safe instance
    let safe = getOrInitializeSafe(event.address, event.block.number)
    safe.threshold = event.params.threshold
    safe.isCreatedByNodeStakeFactory = true
    safe.save()
    
    // add token balance to total tracker
    let safeBalances = Balance.load(safe.balance);
    if (!safeBalances) {
        log.debug("handleSafeSetup cannot read safe balance of %s", [safe.balance])
    } else {
        increaseBalancesTrackerForSafes(event.address.toHex(), safeBalances.mHoprBalance, TokenType.MHOPR)
        increaseBalancesTrackerForSafes(event.address.toHex(), safeBalances.wxHoprBalance, TokenType.WXHOPR)
        increaseBalancesTrackerForSafes(event.address.toHex(), safeBalances.xHoprBalance, TokenType.XHOPR)
    }

    // update owners
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

export function handleEnableModule(event: EnabledModule): void {
    let safeModulePair = getOrInitializeSafeModulePair(event.address, event.params.module.toHex(), event.block.number);
    safeModulePair.save()
}

export function handleDisableModule(event: DisabledModule): void {
    let key = event.address.toHex() + "-" + event.params.module.toHex();
    // remove the SafeModulePair entity
    store.remove('SafeModulePair', key);
}