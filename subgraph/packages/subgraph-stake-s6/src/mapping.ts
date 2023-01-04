import { BigInt, log } from "@graphprotocol/graph-ts"
import { BatchMintCall, HoprBoost, MintCall, Transfer } from "../generated/HoprBoost/HoprBoost"
import {
  BatchStakeForCall,
  Claimed,
  NftAllowed,
  NftBlocked,
  Redeemed,
  Released,
  RewardFueled,
  Staked,
  Sync
} from "../generated/HoprStakeSeason6/HoprStakeSeason6"
import { Account, Boost, Program } from "../generated/schema"
import { ADDRESS_ZERO, initializeAccount, initializeProgram, zeroBigInt } from "./library"

export function handleClaimed(event: Claimed): void {
  // Load accout and program entity
  let account = Account.load(event.params.account.toHex())
  let program = Program.load(event.address.toHex())

  // If entities are null, create new ones
  if (!account) {
    account = initializeAccount(event.params.account.toHex())
  }
  if (!program) {
    program = initializeProgram(event.address.toHex())
  }

  // Update claimed rewards 
  account.claimedRewards = account.claimedRewards.plus(event.params.rewardAmount)
  account.unclaimedRewards = account.unclaimedRewards.minus(event.params.rewardAmount)
  program.totalClaimedRewards = program.totalClaimedRewards.plus(event.params.rewardAmount)
  program.totalUnclaimedRewards = program.totalUnclaimedRewards.minus(event.params.rewardAmount)
  program.availableReward = program.availableReward.minus(event.params.rewardAmount);
  account.save()
  program.save()
}

export function handleNftAllowed(event: NftAllowed): void {
  let program = Program.load(event.address.toHex())
  if (!program) {
    program = initializeProgram(event.address.toHex())
  }
  let index = program.blockedTypeIndexes.indexOf(event.params.typeIndex)
  program.blockedTypeIndexes.splice(index, 1)
  program.save()
}

export function handleNftBlocked(event: NftBlocked): void {
  let program = Program.load(event.address.toHex())
  if (!program) {
    program = initializeProgram(event.address.toHex())
  }
  let blockedTypeIndexes = program.blockedTypeIndexes;
  blockedTypeIndexes.push(event.params.typeIndex)
  program.blockedTypeIndexes = blockedTypeIndexes
  program.save()
}

export function handleRedeemed(event: Redeemed): void {
  // Load accout and program entity and create one if not existing
  let account = Account.load(event.params.account.toHex())
  if (!account) {
    account = initializeAccount(event.params.account.toHex())
  }
  // Get redeemed boost token id
  let tokenId = event.params.boostTokenId.toString();
  let boost = Boost.load(tokenId);

  // Get boost token details
  if (!boost) {
    log.error('Cannot redeem a non-existing nft', [])
    return
  }

  let ignoredBoosts = account.ignoredBoosts;
  let appliedBoosts = account.appliedBoosts;
  // append to the right array
  if (event.params.factorRegistered) {
    // if registered, check if any token Id needs to be removed
    // let temp: Array<Boost> = appliedBoosts.map<Boost>((id: string): Boost => Boost.load(id) as Boost)
    let registeredIndex = appliedBoosts.length == 0 ? -1 : appliedBoosts
      .map<BigInt>((id: string): BigInt => (Boost.load(id) as Boost).boostTypeIndex)
      .indexOf(boost.boostTypeIndex)
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
  if (!account) {
    return;
  }
  // cannot have released without program
  program.totalLocked = program.totalLocked.minus(event.params.actualAmount)
  // reset account state
  if (account.airdropLockedTokenAmount.ge(zeroBigInt())) {
    program.totalAirdrop = program.totalAirdrop.minus(account.airdropLockedTokenAmount)
  }
  account.actualLockedTokenAmount = zeroBigInt()
  account.airdropLockedTokenAmount = zeroBigInt()
  account.boostRate = zeroBigInt()
  account.appliedBoosts = []
  account.ignoredBoosts = []
  account.save()
  program.save()
}

export function handleRewardFueled(event: RewardFueled): void {
  let program = Program.load(event.address.toHex())
  if (!program) {
    program = initializeProgram(event.address.toHex())
  }
  program.availableReward = program.availableReward.plus(event.params.amount);
  program.save()
}

export function handleStaked(event: Staked): void {
  // Accounts can be loaded from the store using a string ID - address
  let account = Account.load(event.params.account.toHex())
  let program = Program.load(event.address.toHex())
  if (!account) {
    account = initializeAccount(event.params.account.toHex())
  }
  if (!program) {
    program = initializeProgram(event.address.toHex())
  }
  account.actualLockedTokenAmount = account.actualLockedTokenAmount.plus(event.params.actualAmount)
  program.totalLocked = program.totalLocked.plus(event.params.actualAmount)
  account.save()
  program.save()
}

export function handleSync(event: Sync): void {
  // Accounts can be loaded from the store using a string ID - address
  let account = Account.load(event.params.account.toHex())
  let program = Program.load(event.address.toHex())
  if (!account) {
    account = initializeAccount(event.params.account.toHex())
  }
  if (!program) {
    program = initializeProgram(event.address.toHex())
  }
  account.cumulatedRewards = account.cumulatedRewards.plus(event.params.increment)
  account.unclaimedRewards = account.unclaimedRewards.plus(event.params.increment)
  account.lastSyncTimestamp = event.block.timestamp
  program.totalCumulatedRewards = program.totalCumulatedRewards.plus(event.params.increment)
  program.totalUnclaimedRewards = program.totalUnclaimedRewards.plus(event.params.increment)
  program.lastSyncTimestamp = event.block.timestamp
  account.save()
  program.save()
}

export function handleBatchStakeFor(call: BatchStakeForCall): void {
  let totalStaked = zeroBigInt()
  for (let i = 0; i < call.inputs._accounts.length; ++i) {
    let accountId = call.inputs._accounts[i].toHex()
    let account = Account.load(accountId)
    if (!account) {
      account = initializeAccount(accountId)
    }
    // only update `airdropLockedTokenAmount` field as Staked event will trigger its handler for `actualLockedTokenAmount`
    account.airdropLockedTokenAmount = account.airdropLockedTokenAmount.plus(call.inputs._stakes[i])
    totalStaked = totalStaked.plus(call.inputs._stakes[i])
    account.save()
  }
  // update the total amount
  let program = Program.load(call.to.toHex())
  if (!program) {
    program = initializeProgram(call.to.toHex())
  }
  program.totalAirdrop = program.totalAirdrop.plus(totalStaked)
}

export function handleTransfer(event: Transfer): void {
  if (event.params.from.toHexString() == ADDRESS_ZERO) {
    let nft = new Boost(event.params.tokenId.toString())
    let boostContract = HoprBoost.bind(event.address)
    nft.boostTypeIndex = boostContract.typeIndexOf(event.params.tokenId)
    let boostDetails = boostContract.boostOf(event.params.tokenId)
    nft.boostNumerator = boostDetails.value0
    nft.redeemDeadline = boostDetails.value1
    nft.uri = boostContract.tokenURI(event.params.tokenId)
    nft.owner = event.params.to
    nft.save()
  } else {
    let boost = Boost.load(event.params.tokenId.toString())
    if (!boost) {
      log.error('Cannot transfer a non-existing nft', [])
      return
    }
    boost.owner = event.params.to
    boost.save()
  }
}
