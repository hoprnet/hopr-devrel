import { BigInt, BigDecimal, Bytes } from '@graphprotocol/graph-ts'
import { Account } from "../generated/schema"

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

export const initializeAccount = (accountId: Bytes): Account => {
  let entity = new Account(accountId)
  entity.blockNumber = zeroBigInt()
  entity.blockTimestamp = zeroBigInt()
  entity.HoprBalance = zeroBigInt()
  return entity;
}

export const updateHoprAccount = (accountId: Bytes, val: BigInt, isPos: boolean, blkNum: BigInt, blkTimeStamp: BigInt): void => {
  let account = Account.load(accountId)

  if (account == null) {
    account = initializeAccount(accountId)
  }
  account.HoprBalance = isPos ? account.HoprBalance.plus(val) : account.HoprBalance.minus(val)
  account.blockNumber = blkNum
  account.blockTimestamp = blkTimeStamp
  account.save()
}