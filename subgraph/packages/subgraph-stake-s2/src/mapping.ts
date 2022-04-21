import { Address, BigInt, log } from "@graphprotocol/graph-ts"
import { HoprBoost, Transfer } from "../generated/HoprBoost/HoprBoost"
import {
  Claimed,
  Redeemed,
  Released,
  RewardFueled,
  Staked,
  Sync
} from "../generated/HoprStake2/HoprStake2"
import { Program, Account, Boost } from "../generated/schema"
import { ADDRESS_ZERO, zeroBigInt, initializeAccount, initializeProgram } from "./library"

export function handleClaimed(event: Claimed): void {
  // Accounts can be loaded from the store using a string ID - address
  let account = Account.load(event.params.account.toHex())
  let program = Program.load(event.address.toHex())
  if (account == null) {
    account = initializeAccount(event.params.account.toHex())
  }
  if (program == null) {
    program = initializeProgram(event.address.toHex())
  }
  account.unclaimedRewards = account.unclaimedRewards.minus(event.params.rewardAmount)
  program.totalUnclaimedRewards = program.totalUnclaimedRewards.minus(event.params.rewardAmount)
  program.currentRewardPool = program.currentRewardPool.minus(event.params.rewardAmount);
  account.save()
  program.save()
}

export function handleRedeemed(event: Redeemed): void {
  let account = Account.load(event.params.account.toHex())
  if (account == null) {
    account = initializeAccount(event.params.account.toHex())
  }
  let tokenId = event.params.boostTokenId.toString();
  let boost = Boost.load(tokenId);
  if (boost == null) {
    log.error('Cannot redeem a non-existing token', [])
    return
  }
  let ignoredBoosts = account.ignoredBoosts;
  let appliedBoosts = account.appliedBoosts;
  // append to the right array
  if (event.params.factorRegistered) {
    // if registered, check if any token Id needs to be removed
    // let temp: Array<Boost> = appliedBoosts.map<Boost>((id: string): Boost => Boost.load(id) as Boost)
    let registeredIndex = appliedBoosts.length == 0 ? -1 : appliedBoosts
      .map<BigInt>((id: string): BigInt => (Boost.load(id) as Boost).boostType)
      .indexOf(boost.boostType)
    log.debug(`parsing tx ${event.transaction.hash.toHex()} to replace index ${registeredIndex}`,[])
    if (registeredIndex > -1) {
      let registered = Boost.load(appliedBoosts[registeredIndex]) as Boost
      ignoredBoosts.push(registered.id)
      appliedBoosts[registeredIndex] = tokenId
      account.boostRate = account.boostRate.minus(registered.boostNumerator).plus(boost.boostNumerator)
    } else {
      appliedBoosts.push(tokenId)
      account.boostRate = account.boostRate.plus(boost.boostNumerator)
    }
  } else {
    ignoredBoosts.push(tokenId)
  }
  account.ignoredBoosts = ignoredBoosts
  account.appliedBoosts = appliedBoosts
  account.save()
}

export function handleReleased(event: Released): void {
  // rate gets deducted
  let account = Account.load(event.params.account.toHex())
  let program = Program.load(event.address.toHex()) as Program
  if (account == null) {
    return;
  }
  // cannot have released without program
  program.totalActualStake = program.totalActualStake.minus(event.params.actualAmount)
  // reset account state
  account.actualStake = zeroBigInt()
  account.boostRate = zeroBigInt()
  account.appliedBoosts = []
  account.ignoredBoosts = []
  account.save()
  program.save()
}

export function handleRewardFueled(event: RewardFueled): void {
  let program = Program.load(event.address.toHex())
  if (program == null) {
    program = initializeProgram(event.address.toHex())
  }
  program.currentRewardPool = program.currentRewardPool.plus(event.params.amount);
  program.save()
}

export function handleStaked(event: Staked): void {
  // Accounts can be loaded from the store using a string ID - address
  let account = Account.load(event.params.account.toHex())
  let program = Program.load(event.address.toHex())
  if (account == null) {
    account = initializeAccount(event.params.account.toHex())
  }
  if (program == null) {
    program = initializeProgram(event.address.toHex())
  }
  account.actualStake = account.actualStake.plus(event.params.actualAmount)
  program.totalActualStake = program.totalActualStake.plus(event.params.actualAmount)
  account.save()
  program.save()
}

export function handleSync(event: Sync): void {
  // Accounts can be loaded from the store using a string ID - address
  let account = Account.load(event.params.account.toHex())
  let program = Program.load(event.address.toHex())
  if (account == null) {
    account = initializeAccount(event.params.account.toHex())
  }
  if (program == null) {
    program = initializeProgram(event.address.toHex())
  }
  account.unclaimedRewards = account.unclaimedRewards.plus(event.params.increment)
  account.lastSyncTimestamp = event.block.timestamp
  program.totalUnclaimedRewards = program.totalUnclaimedRewards.plus(event.params.increment)
  program.lastSyncTimestamp = event.block.timestamp
  account.save()
  program.save()
}

export function handleTransfer(event: Transfer): void {
  if (event.params.from.toHexString() == ADDRESS_ZERO) {
    let nft = new Boost(event.params.tokenId.toString())
    let boostContract = HoprBoost.bind(event.address)
    nft.boostType = boostContract.typeIndexOf(event.params.tokenId)
    let boostDetails = boostContract.boostOf(event.params.tokenId)
    nft.boostNumerator = boostDetails.value0
    nft.redeemDeadline = boostDetails.value1
    nft.save()
  }
}