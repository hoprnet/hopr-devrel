import { BigInt, BigDecimal, Address, crypto, Bytes, ethereum } from '@graphprotocol/graph-ts'
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
  let slice = Bytes.fromHexString(value)
  return BigInt.fromUnsignedBytes(slice)
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

export function initiateTicket(ticketId: string, channelId: string): Ticket {
  let ticket = new Ticket(ticketId)
  ticket.channel = channelId
  ticket.ticketEpoch = zeroBigInt()
  ticket.ticketIndex = zeroBigInt()
  ticket.proofOfRelaySecret = zeroBytes()
  ticket.amount = zeroBD()
  ticket.winProb = zeroBigInt()
  ticket.signature = zeroBytes()
  ticket.redeemedAt

  return ticket
}

export function amountInTicketFromHash(hash: string): BigInt {
  let index = 466
  return convertByteStringToBigInt(hash.slice(index, index+64))
}

export function ticketIndexFromHash(hash: string): BigInt {
  let index = 530
  return convertByteStringToBigInt(hash.slice(index, index+64))
}

export function indexOffsetOffTicketFromHash(hash: string): BigInt {
  let index = 594
  return convertByteStringToBigInt(hash.slice(index, index+64))
}

export function ticketEpochFromHash(hash: string): BigInt {
  let index = 658
  return convertByteStringToBigInt(hash.slice(index, index+64))
}

export function winProbOfTicketFromHash(hash: string): BigInt {
  let index = 722
  return convertByteStringToBigInt(hash.slice(index, index+64))
}

export function ticketSignatureFromHash(hash: string): Bytes {
  let index = 786
  return Bytes.fromHexString(hash.slice(index, index + 640))
}

export function ticketSecretFromHash(hash: string): Bytes {
  let index = 1426
  return Bytes.fromHexString(hash.slice(index, index + 64))
}

// 0x468721a7000000000000000000000000693bac5ce61c720ddc68533991ceb4
// 1199d8f8ae000000000000000000000000000000000000000000000000000000
// 0000000000000000000000000000000000000000000000000000000000000000
// 0000000080000000000000000000000000000000000000000000000000000000
// 0000000000000000000000000000000000000000000000000000000000000000
// 00000002440cd88d72
//
// 00000000000000000000000019a78417065c3054edca3c4b9c02f127a6c2a0ec -- address
// 108cbd4158f5d3c864e67cef315a14e80b5dc711f863fac556c83a03d567367f -- channelid
// 0000000000000000000000000000000000000000000000008c2a687ce7720000 -- amount
// 00000000000000000000000000000000000000000000000000000000000013a2
// 00000000000000000000000000000000000000000000000000000000000000ee
// 0000000000000000000000000000000000000000000000000000000000000003
// 00000000000000000000000000000000000000000000000000ffffffffffffff
// 54f0a2d47128af13ae07c22541b2b518b83daac2fba1613fb3dfadcb74c78064
// f41282c1256bfd3c2ebe3983b4f47b5f0db5ab758fed3c28020f2fd54744dcb9
// d867996a6cd7aa47ff1aa63d8bc361dac071203b10b35bc42fddd02f4ef75ac6
// 10d41749c2ccb9c90ed5962a774c9a183d6e3b5d1cc89c660917500a822ea820
// 0381a32780b1abe1510c22116fac8d36e8041c4e1ea53b21d28e0c64db8e5257
// f7ed30938344eadebb404285a5456201311fcce02d187895a95eb459450076db
// af1dda3315509027b014efe13c88ec85b682e53e67ad13d8cdefac6de2d18a2c
// e15d26f64c101b86a7ba89e99080256c916d16aae43dfc7105050a816a556d5a
// 426ada72ff0c5a150ef3fee51be0ce67b05e785332c5cbf65113019bc4a5a589
// eea4be179d6a2000fcabe43eb6db28739d1d648b62269634c5608a6a6ea6ed7b
// b4ba2e8c6504e9f4a193091b43248cf3d2442c32b442efd12e15dfe3a11bbcf6
// 00000000000000000000000000000000000000000000000000000000
//
// vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv
// 
// 00000000000000000000000019a78417065c3054edca3c4b9c02f127a6c2a0ec -- address
// 108cbd4158f5d3c864e67cef315a14e80b5dc711f863fac556c83a03d567367f -- channelid
// 0000000000000000000000000000000000000000000000008c2a687ce7720000 -- amount
// 00000000000000000000000000000000000000000000000000000000000013a2 -- ticket index
// 00000000000000000000000000000000000000000000000000000000000000ee -- index offset
// 0000000000000000000000000000000000000000000000000000000000000003 -- epoch
// 00000000000000000000000000000000000000000000000000ffffffffffffff -- winProb (denominator is 0xffffffffffffff)
// 54f0a2d47128af13ae07c22541b2b518b83daac2fba1613fb3dfadcb74c78064 -- signature
// f41282c1256bfd3c2ebe3983b4f47b5f0db5ab758fed3c28020f2fd54744dcb9
// d867996a6cd7aa47ff1aa63d8bc361dac071203b10b35bc42fddd02f4ef75ac6
// 10d41749c2ccb9c90ed5962a774c9a183d6e3b5d1cc89c660917500a822ea820
// 0381a32780b1abe1510c22116fac8d36e8041c4e1ea53b21d28e0c64db8e5257
// f7ed30938344eadebb404285a5456201311fcce02d187895a95eb459450076db
// af1dda3315509027b014efe13c88ec85b682e53e67ad13d8cdefac6de2d18a2c
// e15d26f64c101b86a7ba89e99080256c916d16aae43dfc7105050a816a556d5a
// 426ada72ff0c5a150ef3fee51be0ce67b05e785332c5cbf65113019bc4a5a589
// eea4be179d6a2000fcabe43eb6db28739d1d648b62269634c5608a6a6ea6ed7b
// b4ba2e8c6504e9f4a193091b43248cf3d2442c32b442efd12e15dfe3a11bbcf6 -- porSecret
