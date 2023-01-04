import { BigInt, BigDecimal } from '@graphprotocol/graph-ts'
import { Account, Program } from "../generated/schema"

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
const BASE_RATE = BigInt.fromI32(5787); // hardcoded value from staking contract

export function computeRate(amount: BigInt, numerator: BigInt): BigInt {
  return amount.times(numerator)
}

export function computeActualBaseRate(amount: BigInt): BigInt {
  if (amount.equals(zeroBigInt())) {
    return zeroBigInt()
  }
  return computeRate(amount, BASE_RATE)
}

export const ADDRESS_ZERO = '0x0000000000000000000000000000000000000000'

export const initializeAccount = (accountId: string): Account => {
    let entity = new Account(accountId)
    entity.actualLockedTokenAmount = zeroBigInt()
    entity.airdropLockedTokenAmount = zeroBigInt()
    entity.cumulatedRewards = zeroBigInt()
    entity.claimedRewards = zeroBigInt()
    entity.unclaimedRewards = zeroBigInt()
    entity.boostRate = zeroBigInt()
    entity.appliedBoosts = new Array<string>(0);
    entity.ignoredBoosts = new Array<string>(0);
    return entity;
}

export const initializeProgram = (programAddress: string): Program => {
    let entity = new Program(programAddress)
    entity.availableReward = zeroBigInt()
    entity.totalLocked = zeroBigInt()
    entity.totalAirdrop = zeroBigInt()
    entity.totalCumulatedRewards = zeroBigInt()
    entity.totalClaimedRewards = zeroBigInt()
    entity.totalUnclaimedRewards = zeroBigInt()
    entity.blockedTypeIndexes = new Array<BigInt>(0);
    return entity;
}