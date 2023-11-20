import { BigInt, BigDecimal, Address, crypto, Bytes, ethereum } from '@graphprotocol/graph-ts'
import { concat } from '@graphprotocol/graph-ts/helper-functions'
import { TicketRedeemed__Params, ChannelBalanceDecreased, ChannelBalanceIncreased, ChannelClosed, ChannelOpened, OutgoingChannelClosureInitiated } from '../generated/HoprChannels/HoprChannels'
import { Account, Channel, StatusSnapshot } from '../generated/schema'


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

export function zeroBytes(): Bytes {
  return changetype<Bytes>(Bytes.fromHexString('0x0000000000000000000000000000000000000000000000000000000000000000'))
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

/************************************
 ********* Specific Helpers *********
 ************************************/
export function getChannelId(source: Address, destination: Address): Bytes {
  return changetype<Bytes>(crypto.keccak256(concat(source, destination)))
}

export function convertStatusToEnum(status: i32): string {
  return convertI32ToEnum(status)
}

export function convertI32ToEnum(status: i32): string {
  switch (status) {
    case 0:
      return 'CLOSED'
    case 1:
      return 'OPEN'
    case 2:
      return 'PENDING_TO_CLOSE'
    default:
      return 'WTF'
  }
}

export function getOrInitiateAccount(accountId: string): Account {
  let account = Account.load(accountId)

  if (account == null) {
    account = new Account(accountId)
    account.hasAnnounced = false
    account.balance = zeroBD()
    account.multiaddr = []
    account.publicKey = null
    account.fromChannelsCount = zeroBigInt()
    account.toChannelsCount = zeroBigInt()
  }

  return account as Account;
}

export function initiateChannel(channelId: string, sourceId: string, destinationId: string): Channel {
  let channel = new Channel(channelId);
  channel.source = sourceId
  channel.destination = destinationId
  channel.balance = zeroBD()
  channel.channelEpoch = zeroBigInt()
  channel.ticketEpoch = zeroBigInt()
  channel.ticketIndex = zeroBigInt()
  channel.status = convertI32ToEnum(0)
  channel.lastOpenedAt = zeroBigInt()
  channel.lastClosedAt = zeroBigInt()
  channel.redeemedTicketCount = zeroBigInt()

  return channel;
}
