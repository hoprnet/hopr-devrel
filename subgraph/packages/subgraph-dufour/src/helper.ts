import { Address, BigDecimal, BigInt, dataSource, log } from "@graphprotocol/graph-ts";
import { Balances, Safe, NodeManagementModule, ModuleNodePair, Account, SafeOwnerPair, Allowances, SafeModulePair, NodeSafeRegistration, NetworkRegistration } from "../generated/schema";
import { wxHoprToken as ERC20Token } from "../generated/wxHoprToken/wxHoprToken";
import { ALL_THE_SAFES_KEY, CHANNELS_CONTRACT_ADDRESS, DECIMALS, MHOPR_TOKEN_ADDRESS, WXHOPR_TOKEN_ADDRESS, XHOPR_TOKEN_ADDRESS } from "./constants";
import { TokenType } from "./types";

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

export const getOrInitializeBalancesTrackerForSafes = (): Balances => {
  let balancesTracker = Balances.load(ALL_THE_SAFES_KEY)
  if (!balancesTracker) {
    balancesTracker = new Balances(ALL_THE_SAFES_KEY)
    balancesTracker.mHoprBalance = BigDecimal.zero()
    balancesTracker.wxHoprBalance = BigDecimal.zero()
    balancesTracker.xHoprBalance = BigDecimal.zero()
    // `lastCompletedProcessedBlock` is not important for total balance tracker
    balancesTracker.lastCompletedProcessedBlock = BigInt.zero()
    balancesTracker.save()
  }
  return balancesTracker
}

export const increaseBalancesTrackerForSafes = (accountAddress: string, amount: BigDecimal, tokenType: TokenType): void => {
  let balancesTracker = getOrInitializeBalancesTrackerForSafes();
  // check if it's a tracked safe
  let safe = Safe.load(accountAddress);
  if (!safe ) {
    log.debug("increaseBalancesTrackerForSafes of account %s does not have safe record", [accountAddress])
    return
  }
  
  if (!safe.isCreatedByNodeStakeFactory) {
    log.debug("increaseBalancesTrackerForSafes of safe %s was not created by the factory", [accountAddress])
    return
  }
  // FIXME: TODO: Replace by
  // balancesTracker = increaseBalances(balancesTracker, amount, tokenType);
  if (amount.gt(BigDecimal.zero())) {
    switch (tokenType) {
        case TokenType.MHOPR:
          balancesTracker.mHoprBalance = balancesTracker.mHoprBalance.plus(amount);
          break;
        case TokenType.WXHOPR:
          balancesTracker.wxHoprBalance = balancesTracker.wxHoprBalance.plus(amount);
          break;
        case TokenType.XHOPR:
          balancesTracker.xHoprBalance = balancesTracker.xHoprBalance.plus(amount);
          break;
        default:
          break;
    }
  }
  balancesTracker.save()
}

export const decreaseBalancesTrackerForSafes = (accountAddress: string, amount: BigDecimal, tokenType: TokenType): void => {
  let balancesTracker = getOrInitializeBalancesTrackerForSafes();
  // check if it's a tracked safe
  let safe = Safe.load(accountAddress);
  if (!safe ) {
    log.debug("increaseBalancesTrackerForSafes of account %s does not have safe record", [accountAddress])
    return
  }
  
  if (!safe.isCreatedByNodeStakeFactory) {
    log.debug("increaseBalancesTrackerForSafes of safe %s was not created by the factory", [accountAddress])
    return
  }
  
  // update balances
  if (amount.gt(BigDecimal.zero())) {
    switch (tokenType) {
        case TokenType.MHOPR:
          balancesTracker.mHoprBalance = balancesTracker.mHoprBalance.minus(amount);
          break;
        case TokenType.WXHOPR:
          balancesTracker.wxHoprBalance = balancesTracker.wxHoprBalance.minus(amount);
          break;
        case TokenType.XHOPR:
          balancesTracker.xHoprBalance = balancesTracker.xHoprBalance.minus(amount);
          break;
        default:
          break;
    }
}
  balancesTracker.save()
}

export const getOrInitializeAccount = (accountAddress: string): Account => {
  let account = Account.load(accountAddress);
  if (!account) {
    account = new Account(accountAddress);
    account.save();
  }
  return account;
}

const tryGetAllowanceContractOrZero = (tokenContractAddress: string, owner: Address, spener: Address): BigDecimal => {
  let tokenContract = ERC20Token.bind(Address.fromString(tokenContractAddress))
  let getBalanceCallResult = tokenContract.try_allowance(owner, spener)
  if (getBalanceCallResult.reverted) {
    return BigInt.zero().toBigDecimal();
  }
  return getBalanceCallResult.value.divDecimal(decimalBase)
}

export const getOrInitializeAllowances = (account: Address): Allowances => {
  let allowance = Allowances.load(account.toHex());
  if (!allowance) {
    allowance = new Allowances(account.toHex());
    let channelsContract = Address.fromString(CHANNELS_CONTRACT_ADDRESS)
    allowance.grantedToChannelsContract = channelsContract
    // get the latest allowance of current block
    log.debug("tryGetAllowanceOfContractOrZero mHoprContract", [])
    allowance.mHoprAllowance = tryGetAllowanceContractOrZero(MHOPR_TOKEN_ADDRESS, account, channelsContract);
    log.debug("tryGetAllowanceOfContractOrZero wxHoprContract", [])
    allowance.wxHoprAllowance = tryGetAllowanceContractOrZero(WXHOPR_TOKEN_ADDRESS, account, channelsContract);
    log.debug("tryGetAllowanceOfContractOrZero xHoprContract", [])
    allowance.xHoprAllowance = tryGetAllowanceContractOrZero(XHOPR_TOKEN_ADDRESS, account, channelsContract);
    // this prevents further handling `Transfer` events on the current block
    allowance.save()
  }
  return allowance;
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
    let allowances = getOrInitializeAllowances(safeAddress)
    allowances.save()
    safe.allowances = allowances.id
    safe.threshold = BigInt.zero();
    safe.isCreatedByNodeStakeFactory = false;
    safe.isEligibleOnNetworkRegistry = false;
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

export const getOrInitializeSafeModulePair = (safeAddress: Address, moduleAddress: string, blockNumber: BigInt): SafeModulePair => {
  let key = safeAddress.toHex() + "-" + moduleAddress;
  let safeModulePair = SafeModulePair.load(key);
  if (!safeModulePair) {
    safeModulePair = new SafeModulePair(key);
    safeModulePair.safe = getOrInitializeSafe(safeAddress, blockNumber).id;
    safeModulePair.module = getOrInitializeAccount(moduleAddress).id;
    safeModulePair.save();
  }
  return safeModulePair
}

export const getOrInitializeNodeSafeRegistration = (safeAddress: Address, nodeAddress: string, blockNumber: BigInt): NodeSafeRegistration => {
  let key = safeAddress.toHex() + "-" + nodeAddress;
  let nodeSafeRegistration = NodeSafeRegistration.load(key);
  if (!nodeSafeRegistration) {
    nodeSafeRegistration = new NodeSafeRegistration(key);
    nodeSafeRegistration.safe = getOrInitializeSafe(safeAddress, blockNumber).id;
    nodeSafeRegistration.node = getOrInitializeAccount(nodeAddress).id;
    nodeSafeRegistration.save();
  }
  return nodeSafeRegistration
}

export const getOrInitializeNetworkRegistration = (safeAddress: Address, nodeAddress: string, blockNumber: BigInt): NetworkRegistration => {
  let key = safeAddress.toHex() + "-" + nodeAddress;
  let networkRegistration = NetworkRegistration.load(key);
  if (!networkRegistration) {
    networkRegistration = new NetworkRegistration(key);
    networkRegistration.safe = getOrInitializeSafe(safeAddress, blockNumber).id;
    networkRegistration.node = getOrInitializeAccount(nodeAddress).id;
    networkRegistration.save();
  }
  return networkRegistration
}