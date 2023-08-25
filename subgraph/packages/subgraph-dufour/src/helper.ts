import { Address, BigInt, dataSource } from "@graphprotocol/graph-ts";
import { Balances, Safe, NodeManagementModule, ModuleNodePair, Account, SafeOwnerPair } from "../generated/schema";

// get or initialize
export const getOrInitializeBalances = (walletAddress: string): Balances => {
  let balance = Balances.load(walletAddress);
  if (!balance) {
    balance = new Balances(walletAddress);
    balance.walletAddress = Address.fromHexString(walletAddress);
    balance.mHoprBalance = BigInt.fromI32(0);
    balance.wxHoprBalance = BigInt.fromI32(0);
    balance.xHoprBalance = BigInt.fromI32(0);
    balance.save()
  }
  return balance;
}

export const getOrInitializeAccount = (accountAddress: string): Account => {
  let account = Account.load(accountAddress);
  if (!account) {
    account = new Account(accountAddress);
    account.save();
  }
  return account;
}

// get or initialize Safe
export const getOrInitializeSafe = (safeAddress: string): Safe => {
  let safe = Safe.load(safeAddress);
  if (!safe) {
    safe = new Safe(safeAddress);
    safe.threshold = BigInt.zero();
    safe.isCreatedByNodeStakeFactory = false;
    safe.save()
  }
  return safe;
}

// get implementation address
export const getImplementationFromContext = (): Address => {
  let context = dataSource.context()
  let moduleImplementation = context.getString('moduleImplementation')
  return Address.fromString(moduleImplementation);
}

// get or initialize NodeManagementModule
export const getOrInitializeNodeManagementModule = (moduleAddress: string): NodeManagementModule => {
  let nodeManagementmodule = NodeManagementModule.load(moduleAddress);
  if (!nodeManagementmodule) {
    nodeManagementmodule = new NodeManagementModule(moduleAddress);
    nodeManagementmodule.implementation = getImplementationFromContext();
    let targetSafe = getOrInitializeSafe(Address.zero().toHex());
    targetSafe.save();
    nodeManagementmodule.target = targetSafe.id;
    nodeManagementmodule.multiSend = Address.zero();
    nodeManagementmodule.save()
  }
  return nodeManagementmodule;
}

export const getOrInitializeModuleNodePair = (moduleAddress: string, nodeAddress: string): ModuleNodePair => {
  let key = moduleAddress + "-" + nodeAddress;
  let moduleNodePair = ModuleNodePair.load(key);
  if (!moduleNodePair) {
    moduleNodePair = new ModuleNodePair(key);
    moduleNodePair.module = getOrInitializeNodeManagementModule(moduleAddress).id;
    moduleNodePair.node = getOrInitializeAccount(nodeAddress).id;
    moduleNodePair.save();
  }
  return moduleNodePair
}

export const getOrInitializeSafeOwnerPair = (safeAddress: string, ownerAddress: string): SafeOwnerPair => {
  let key = safeAddress + "-" + ownerAddress;
  let safeOwnerPair = SafeOwnerPair.load(key);
  if (!safeOwnerPair) {
    safeOwnerPair = new SafeOwnerPair(key);
    safeOwnerPair.safe = getOrInitializeSafe(safeAddress).id;
    safeOwnerPair.owner = getOrInitializeAccount(ownerAddress).id;
    safeOwnerPair.save();
  }
  return safeOwnerPair
}