import { store } from '@graphprotocol/graph-ts'
import { NodeAdded, NodeRemoved, OwnershipTransferred, SetMultisendAddress, Upgraded } from "../generated/templates/NodeManagementModule/NodeManagementModule";
import { getOrInitializeModuleNodePair, getOrInitializeNodeManagementModule, getOrInitializeSafe } from "./helper";

export function handleSetMultiSendAddress(event: SetMultisendAddress): void {
    let nodeManagementmodule = getOrInitializeNodeManagementModule(event.address.toHex(), event.block.number);
    nodeManagementmodule.multiSend = event.params.multisendAddress;
    nodeManagementmodule.save()
}

export function handleTransferOwnership(event: OwnershipTransferred): void {
    let nodeManagementmodule = getOrInitializeNodeManagementModule(event.address.toHex(), event.block.number);
    // assuming the new owner is also a Safe. If not it does not matter much
    let targetSafe = getOrInitializeSafe(event.params.newOwner, event.block.number);
    targetSafe.save();
    nodeManagementmodule.target = targetSafe.id;
    nodeManagementmodule.save()
}

export function handleAddNode(event: NodeAdded): void {
    let nodeModulePair = getOrInitializeModuleNodePair(event.address.toHex(), event.params.node.toHex(), event.block.number);
    nodeModulePair.save()
}

export function handleRemoveNode(event: NodeRemoved): void {
    let key = event.address.toHex() + "-" + event.params.node.toHex();
    // remove the ModuleNodePair entity
    store.remove('ModuleNodePair', key);
}

export function handleUpgrade(event: Upgraded): void {
    let nodeManagementmodule = getOrInitializeNodeManagementModule(event.address.toHex(), event.block.number);
    nodeManagementmodule.implementation = event.params.implementation;
    nodeManagementmodule.save()
}