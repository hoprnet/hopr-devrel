import { Address, log, TypedMap } from "@graphprotocol/graph-ts"
import { BigInt, BigDecimal } from '@graphprotocol/graph-ts'
import { Account, StakeSeason, StakingParticipation } from "../generated/schema"

/************************************
 ********** General Helpers *********
 ************************************/

export function exponentToBigDecimal(decimals: number): BigDecimal {
  let bd = BigDecimal.fromString('1')
  for (let i = 0; i < decimals; i++) {
    bd = bd.times(BigDecimal.fromString('10'))
  }
  return bd
}

export function bigDecimalExp18(): BigDecimal {
  return BigDecimal.fromString('1000000000000000000')
}

export function zeroBD(): BigDecimal {
  return BigDecimal.fromString('0')
}

export function zeroBigInt(): BigInt {
  return BigInt.fromI32(0)
}

export function oneBigInt(): BigInt {
  return BigInt.fromI32(1)
}

export function convertEthToDecimal(eth: BigInt): BigDecimal {
  return eth.toBigDecimal().div(exponentToBigDecimal(18))
}

export function equalToZero(value: BigDecimal): boolean {
  const formattedVal = parseFloat(value.toString())
  const zero = parseFloat(zeroBD().toString())
  if (zero == formattedVal) {
    return true
  }
  return false
}

export function isNullEthValue(value: string): boolean {
  return value == '0x0000000000000000000000000000000000000000000000000000000000000001'
}

/************************************
 ********* Specific Helpers *********
 ************************************/

export const StakeSeasonTable = new TypedMap<string, BigInt>();
StakeSeasonTable.set('0xdc8f03f19986859362d15c3d5ed74f26518870b9', BigInt.fromI32(8))
StakeSeasonTable.set('0x65c39e6bd97f80b5ae5d2120a47644578fd2b8dc', BigInt.fromI32(7))
StakeSeasonTable.set('0xa02af160a280957a8881879ee9239a614ab47f0d', BigInt.fromI32(6))
StakeSeasonTable.set('0xd80fbbfe9d057254d80eebb49f17aca66a238e2d', BigInt.fromI32(5))
StakeSeasonTable.set('0x5bb7e435ada333a6714e27962e4bb6afde1cecd4', BigInt.fromI32(4))
StakeSeasonTable.set('0xae933331ef0be122f9499512d3ed4fa3896dcf20', BigInt.fromI32(3))
StakeSeasonTable.set('0x2cdd13ddb0346e0f620c8e5826da5d7230341c6e', BigInt.fromI32(2))
StakeSeasonTable.set('0x912f4d6607160256787a2ad40da098ac2afe57ac', BigInt.fromI32(1))

export function computeRate(amount: BigInt, numerator: BigInt): BigInt {
  return amount.times(numerator)
}

export const ADDRESS_ZERO = '0x0000000000000000000000000000000000000000'

export const getOrInitializeAccount = (accountId: string): Account => {
  let account = Account.load(accountId)
  if (!account) {
    account = new Account(accountId)
    account.save()
  }
  return account;
}

export const getOrInitializeStakeSeason = (stakeContractAddr: string): StakeSeason => {
  let stakeSeason = StakeSeason.load(stakeContractAddr)
  if (!stakeSeason) {
    stakeSeason = new StakeSeason(stakeContractAddr)

    // get season number
    let stakeSeasonNum = StakeSeasonTable.get(stakeContractAddr)
    if (!stakeSeasonNum) {
      log.error('Cannot find stake season info with address {}', [stakeContractAddr])
      stakeSeasonNum = zeroBigInt();
    } else {
      log.debug('Stake season {} has number {}', [stakeContractAddr, stakeSeasonNum.toString()])
    }
    stakeSeason.seasonNumber = stakeSeasonNum

    stakeSeason.availableReward = zeroBigInt()
    stakeSeason.totalLocked = zeroBigInt()
    stakeSeason.totalVirtual = zeroBigInt()
    stakeSeason.totalAirdrop = zeroBigInt()
    stakeSeason.totalCumulatedRewards = zeroBigInt()
    stakeSeason.totalClaimedRewards = zeroBigInt()
    stakeSeason.totalUnclaimedRewards = zeroBigInt()
    stakeSeason.lastSyncTimestamp = zeroBigInt()
    stakeSeason.blockedTypeIndexes = new Array<BigInt>(0);
    stakeSeason.save()
  }
  return stakeSeason;
}

export const getOrInitializeStakingParticipation = (stakingSeasonAddr: string, accountId: string): StakingParticipation => {
  let stakingParticipationId = stakingSeasonAddr.concat(accountId)
  let stakingParticipation = StakingParticipation.load(stakingParticipationId)

  if (!stakingParticipation) {
    // initialize participation
    stakingParticipation = new StakingParticipation(stakingParticipationId)
    let account = getOrInitializeAccount(accountId)
    account.save()
    stakingParticipation.account = account.id
    let stakingSeason = getOrInitializeStakeSeason(stakingSeasonAddr)
    stakingSeason.save()
    stakingParticipation.stakingSeason = stakingSeason.id
    stakingParticipation.actualLockedTokenAmount = zeroBigInt()
    stakingParticipation.virtualLockedTokenAmount = zeroBigInt()
    stakingParticipation.airdropLockedTokenAmount = zeroBigInt()
    stakingParticipation.lastSyncTimestamp = zeroBigInt()
    stakingParticipation.cumulatedRewards = zeroBigInt()
    stakingParticipation.claimedRewards = zeroBigInt()
    stakingParticipation.unclaimedRewards = zeroBigInt()
    stakingParticipation.boostRate = zeroBigInt()
    stakingParticipation.appliedBoosts = new Array<string>(0);
    stakingParticipation.ignoredBoosts = new Array<string>(0);
    stakingParticipation.save()
  }
  return stakingParticipation;
}