import { Address, BigDecimal, BigInt, dataSource, log } from "@graphprotocol/graph-ts";
import { Balances, Safe, NodeManagementModule, ModuleNodePair, Account, SafeOwnerPair } from "../generated/schema";
import { wxHoprToken as ERC20Token } from "../generated/wxHoprToken/wxHoprToken";
import { DECIMALS, MHOPR_TOKEN_ADDRESS, WXHOPR_TOKEN_ADDRESS, XHOPR_TOKEN_ADDRESS } from "./constants";

export const decimalBase = BigDecimal.fromString(DECIMALS)

const tryGetBalanceOfContractOrZero = (tokenContractAddress: string, account: Address): BigDecimal => {
  let tokenContract = ERC20Token.bind(Address.fromString(tokenContractAddress))
  let getBalanceCallResult = tokenContract.try_balanceOf(account)
  if (getBalanceCallResult.reverted) {
    return BigInt.zero().toBigDecimal();
  }
  return getBalanceCallResult.value.divDecimal(decimalBase)
}

export const getOrInitializeBalances = (account: Address, blockNumber: BigInt): Balances => {
  let balance = Balances.load(account.toHex());
  if (!balance) {
    balance = new Balances(account.toHex());
    // get the latest balance of current block
    log.debug("tryGetBalanceOfContractOrZero mHoprContract at block %s", [blockNumber.toString()])
    balance.mHoprBalance = tryGetBalanceOfContractOrZero(MHOPR_TOKEN_ADDRESS, account);
    log.debug("tryGetBalanceOfContractOrZero wxHoprContract at block %s", [blockNumber.toString()])
    balance.wxHoprBalance = tryGetBalanceOfContractOrZero(WXHOPR_TOKEN_ADDRESS, account);
    log.debug("tryGetBalanceOfContractOrZero xHoprContract at block %s", [blockNumber.toString()])
    balance.xHoprBalance = tryGetBalanceOfContractOrZero(XHOPR_TOKEN_ADDRESS, account);
    // update the `lastCompletedProcessedBlock` with current block number
    // this prevents further handling `Transfer` events on the current block
    balance.lastCompletedProcessedBlock = blockNumber
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
export const getOrInitializeSafe = (safeAddress: Address, blockNumber: BigInt): Safe => {
  let safe = Safe.load(safeAddress.toHex());
  log.debug("getOrInitializeSafe of safe %s at block %s", [safeAddress.toHex(), blockNumber.toString()])
  if (!safe) {
    safe = new Safe(safeAddress.toHex());
    let balances = getOrInitializeBalances(safeAddress, blockNumber);
    balances.save()
    safe.balances = balances.id
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
export const getOrInitializeNodeManagementModule = (moduleAddress: string, blockNumber: BigInt): NodeManagementModule => {
  let nodeManagementmodule = NodeManagementModule.load(moduleAddress);
  if (!nodeManagementmodule) {
    nodeManagementmodule = new NodeManagementModule(moduleAddress);
    nodeManagementmodule.implementation = getImplementationFromContext();
    let targetSafe = getOrInitializeSafe(Address.zero(), blockNumber);
    targetSafe.save();
    nodeManagementmodule.target = targetSafe.id;
    nodeManagementmodule.multiSend = Address.zero();
    nodeManagementmodule.save()
  }
  return nodeManagementmodule;
}

export const getOrInitializeModuleNodePair = (moduleAddress: string, nodeAddress: string, blockNumber: BigInt): ModuleNodePair => {
  let key = moduleAddress + "-" + nodeAddress;
  let moduleNodePair = ModuleNodePair.load(key);
  if (!moduleNodePair) {
    moduleNodePair = new ModuleNodePair(key);
    moduleNodePair.module = getOrInitializeNodeManagementModule(moduleAddress, blockNumber).id;
    moduleNodePair.node = getOrInitializeAccount(nodeAddress).id;
    moduleNodePair.save();
  }
  return moduleNodePair
}

export const getOrInitializeSafeOwnerPair = (safeAddress: Address, ownerAddress: string, blockNumber: BigInt): SafeOwnerPair => {
  let key = safeAddress.toHex() + "-" + ownerAddress;
  let safeOwnerPair = SafeOwnerPair.load(key);
  if (!safeOwnerPair) {
    safeOwnerPair = new SafeOwnerPair(key);
    safeOwnerPair.safe = getOrInitializeSafe(safeAddress, blockNumber).id;
    safeOwnerPair.owner = getOrInitializeAccount(ownerAddress).id;
    safeOwnerPair.save();
  }
  return safeOwnerPair
}