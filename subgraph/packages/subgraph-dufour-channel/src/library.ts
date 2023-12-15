import { BigInt, BigDecimal, Address, crypto, Bytes, ethereum, log, ByteArray } from '@graphprotocol/graph-ts'
import { concat } from '@graphprotocol/graph-ts/helper-functions'
import { TicketRedeemed__Params, ChannelBalanceDecreased, ChannelBalanceIncreased, ChannelClosed, ChannelOpened, OutgoingChannelClosureInitiated } from '../generated/HoprChannels/HoprChannels'
import { Account, Channel, Ticket } from '../generated/schema'


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

export function convertByteStringToBigInt(value: string): BigInt {
  const bytes = ByteArray.fromHexString(value).reverse()
  return BigInt.fromByteArray(changetype<ByteArray>(bytes));
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
  channel.lastUpdatedAt = zeroBigInt()
  channel.redeemedTicketCount = zeroBigInt()

  return channel;
}

export function initiateTicket(ticketId: string, channelId: string): Ticket {
  let ticket = new Ticket(ticketId)
  ticket.channel = channelId
  ticket.ticketEpoch = zeroBigInt()
  ticket.ticketIndex = zeroBigInt()
  ticket.proofOfRelaySecret = zeroBytes()
  ticket.amount = zeroBD()
  ticket.winProb = zeroBigInt()
  ticket.signature = zeroBytes()
  ticket.redeemedAt = zeroBigInt()

  return ticket
}

export function amountInTicketFromHash(hash: string): BigInt {
  let index = 466
  let slice = hash.slice(index, index + 64)
  let val = convertByteStringToBigInt(slice)
  log.info("amountInTicketFromHash: {} -> {}", [slice, val.toString()])
  return val
}

export function ticketIndexFromHash(hash: string): BigInt {
  let index = 530
  let slice = hash.slice(index, index + 64)
  let val = convertByteStringToBigInt(slice)
  log.info("ticketIndexFromHash: {} -> {}", [slice, val.toString()])
  return val
}

export function indexOffsetFromHash(hash: string): BigInt {
  let index = 594
  let slice = hash.slice(index, index + 64)
  let val = convertByteStringToBigInt(slice)
  log.info("indexOffsetFromHash: {} -> {}", [slice, val.toString()])
  return val
}

export function ticketEpochFromHash(hash: string): BigInt {
  let index = 658
  let slice = hash.slice(index, index + 64)
  let val = convertByteStringToBigInt(slice)
  log.info("ticketEpochFromHash: {} -> {}", [slice, val.toString()])
  return val
}

export function winProbFromHash(hash: string): BigInt {
  let index = 722
  let slice = hash.slice(index, index + 64)
  let val = convertByteStringToBigInt(slice)
  log.info("winProbFromHash: {} -> {}", [slice, val.toString()])
  return val
}

export function ticketSignatureFromHash(hash: string): Bytes {
  let index = 786
  let slice = hash.slice(index, index + 64)
  log.info("ticketSignatureFromHash: {}", [slice])
  return Bytes.fromHexString(slice)
}

export function ticketSecretFromHash(hash: string): Bytes {
  let index = 840
  let slice = hash.slice(index, index + 640)
  log.info("ticketSecretFromHash: {}", [slice])
  return Bytes.fromHexString(slice)
}