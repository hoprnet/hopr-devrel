import { BigInt, log } from "@graphprotocol/graph-ts"
import {
  Claimed,
  NftAllowed,
  NftBlocked,
  Redeemed,
  Released,
  RewardFueled,
  Staked,
  Sync
} from "../generated/HoprStakeSeason6/HoprStakeBase"
import { Released as ReleasedWithVirtual, Staked as StakedWithVirtual} from "../generated/HoprStakeSeason1/HoprStake"
import { Boost } from "../generated/schema"
import { getOrInitializeStakeSeason, getOrInitializeStakingParticipation, zeroBigInt } from "./library"

export function handleClaimed(event: Claimed): void {
  let stakeSeason = getOrInitializeStakeSeason(event.address.toHex())
  stakeSeason.totalClaimedRewards = stakeSeason.totalClaimedRewards.plus(event.params.rewardAmount)
  stakeSeason.totalUnclaimedRewards = stakeSeason.totalUnclaimedRewards.minus(event.params.rewardAmount)
  stakeSeason.availableReward = stakeSeason.availableReward.minus(event.params.rewardAmount);
  stakeSeason.save()

  let stakingParticipation = getOrInitializeStakingParticipation(event.address.toHex(), event.params.account.toHex())
  stakingParticipation.claimedRewards = stakingParticipation.claimedRewards.plus(event.params.rewardAmount)
  stakingParticipation.unclaimedRewards = stakingParticipation.unclaimedRewards.minus(event.params.rewardAmount)
  stakingParticipation.save()
}

export function handleNftAllowed(event: NftAllowed): void {
  let stakeSeason = getOrInitializeStakeSeason(event.address.toHex())
  let index = stakeSeason.blockedTypeIndexes.indexOf(event.params.typeIndex)
  stakeSeason.blockedTypeIndexes.splice(index, 1)
  stakeSeason.save()
}

export function handleNftBlocked(event: NftBlocked): void {
  let stakeSeason = getOrInitializeStakeSeason(event.address.toHex())
  let blockedTypeIndexes = stakeSeason.blockedTypeIndexes;
  blockedTypeIndexes.push(event.params.typeIndex)
  stakeSeason.blockedTypeIndexes = blockedTypeIndexes
  stakeSeason.save()
}

export function handleRedeemed(event: Redeemed): void {
  // Load accout staking participation and StakeSeason entity and create one if not existing
  let accountAddr = event.params.account.toHex()
  let stakingParticipation = getOrInitializeStakingParticipation(event.address.toHex(), accountAddr)

  // Get redeemed boost token id
  let tokenId = event.params.boostTokenId.toString();
  let boost = Boost.load(tokenId);

  // Get boost token details
  if (!boost) {
    log.error('Cannot redeem a non-existing nft', [])
    return
  }

  let ignoredBoosts = stakingParticipation.ignoredBoosts;
  let appliedBoosts = stakingParticipation.appliedBoosts;
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
      stakingParticipation.boostRate = stakingParticipation.boostRate.minus(registered.boostNumerator).plus(boost.boostNumerator)
    } else {
      appliedBoosts.push(tokenId)
      stakingParticipation.boostRate = stakingParticipation.boostRate.plus(boost.boostNumerator)
    }
  } else {
    ignoredBoosts.push(tokenId)
  }
  stakingParticipation.ignoredBoosts = ignoredBoosts
  stakingParticipation.appliedBoosts = appliedBoosts
  stakingParticipation.save()
}

export function handleReleased(event: Released): void {
  let stakingParticipation = getOrInitializeStakingParticipation(event.address.toHex(), event.params.account.toHex())
  let stakeSeason = getOrInitializeStakeSeason(event.address.toHex())

  // update stake program
  stakeSeason.totalLocked = stakeSeason.totalLocked.minus(event.params.actualAmount)
  if (stakingParticipation.airdropLockedTokenAmount.ge(zeroBigInt())) {
    stakeSeason.totalAirdrop = stakeSeason.totalAirdrop.minus(stakingParticipation.airdropLockedTokenAmount)
  }
  stakeSeason.save()

  // update staking participation
  stakingParticipation.actualLockedTokenAmount = zeroBigInt()
  stakingParticipation.virtualLockedTokenAmount = zeroBigInt()
  stakingParticipation.airdropLockedTokenAmount = zeroBigInt()
  stakingParticipation.boostRate = zeroBigInt()
  stakingParticipation.appliedBoosts = []
  stakingParticipation.ignoredBoosts = []
  stakingParticipation.save()
}

export function handleReleasedWithVirtual(event: ReleasedWithVirtual): void {
  let stakingParticipation = getOrInitializeStakingParticipation(event.address.toHex(), event.params.account.toHex())
  let stakeSeason = getOrInitializeStakeSeason(event.address.toHex())

  // update stake program
  stakeSeason.totalLocked = stakeSeason.totalLocked.minus(event.params.actualAmount)
  stakeSeason.totalVirtual = stakeSeason.totalVirtual.minus(event.params.virtualAmount)
  if (stakingParticipation.airdropLockedTokenAmount.ge(zeroBigInt())) {
    stakeSeason.totalAirdrop = stakeSeason.totalAirdrop.minus(stakingParticipation.airdropLockedTokenAmount)
  }
  stakeSeason.save()

  // update staking participation
  stakingParticipation.actualLockedTokenAmount = zeroBigInt()
  stakingParticipation.virtualLockedTokenAmount = zeroBigInt()
  stakingParticipation.airdropLockedTokenAmount = zeroBigInt()
  stakingParticipation.boostRate = zeroBigInt()
  stakingParticipation.appliedBoosts = []
  stakingParticipation.ignoredBoosts = []
  stakingParticipation.save()
}

export function handleRewardFueled(event: RewardFueled): void {
  let stakeSeason = getOrInitializeStakeSeason(event.address.toHex())
  stakeSeason.availableReward = stakeSeason.availableReward.plus(event.params.amount);
  stakeSeason.save()
}

export function handleStaked(event: Staked): void {
  let stakingParticipation = getOrInitializeStakingParticipation(event.address.toHex(), event.params.account.toHex())
  let stakeSeason = getOrInitializeStakeSeason(event.address.toHex())

  stakingParticipation.actualLockedTokenAmount = stakingParticipation.actualLockedTokenAmount.plus(event.params.actualAmount)
  stakeSeason.totalLocked = stakeSeason.totalLocked.plus(event.params.actualAmount)

  // when the staking account is not the caller - this implys that the Staked event comes from a `batchStakeFor` event
  if (!event.params.account.equals(event.transaction.from)) {
    stakingParticipation.airdropLockedTokenAmount = stakingParticipation.airdropLockedTokenAmount.plus(event.params.actualAmount)
    stakeSeason.totalAirdrop = stakeSeason.totalAirdrop.plus(event.params.actualAmount)
  }
  stakeSeason.save()
  stakingParticipation.save()
}

export function handleStakedWithVirtual(event: StakedWithVirtual): void {
  let stakingParticipation = getOrInitializeStakingParticipation(event.address.toHex(), event.params.account.toHex())
  let stakeSeason = getOrInitializeStakeSeason(event.address.toHex())

  stakingParticipation.actualLockedTokenAmount = stakingParticipation.actualLockedTokenAmount.plus(event.params.actualAmount)
  stakingParticipation.virtualLockedTokenAmount = stakingParticipation.virtualLockedTokenAmount.plus(event.params.virtualAmount)
  
  stakeSeason.totalLocked = stakeSeason.totalLocked.plus(event.params.actualAmount)
  stakeSeason.totalVirtual = stakeSeason.totalVirtual.plus(event.params.virtualAmount)

  // when the staking account is not the caller - this implys that the Staked event comes from a `batchStakeFor` event
  if (!event.params.account.equals(event.transaction.from)) {
    stakingParticipation.airdropLockedTokenAmount = stakingParticipation.airdropLockedTokenAmount.plus(event.params.actualAmount)
    stakeSeason.totalAirdrop = stakeSeason.totalAirdrop.plus(event.params.actualAmount)
  }
  stakeSeason.save()
  stakingParticipation.save()
}

export function handleSync(event: Sync): void {
  // Accounts can be loaded from the store using a string ID - address
  let stakeSeason = getOrInitializeStakeSeason(event.address.toHex())
  stakeSeason.totalCumulatedRewards = stakeSeason.totalCumulatedRewards.plus(event.params.increment)
  stakeSeason.totalUnclaimedRewards = stakeSeason.totalUnclaimedRewards.plus(event.params.increment)
  stakeSeason.lastSyncTimestamp = event.block.timestamp
  stakeSeason.save()

  let stakingParticipation = getOrInitializeStakingParticipation(event.address.toHex(), event.params.account.toHex())
  stakingParticipation.cumulatedRewards = stakingParticipation.cumulatedRewards.plus(event.params.increment)
  stakingParticipation.unclaimedRewards = stakingParticipation.unclaimedRewards.plus(event.params.increment)
  stakingParticipation.lastSyncTimestamp = event.block.timestamp
  stakingParticipation.save()
}
