import { Address, BigInt } from "@graphprotocol/graph-ts";
import { Balances } from "../generated/schema";

// get or initialize
export const getOrInitializeBalances = (walletAddress: string): Balances => {
  let balance = Balances.load(walletAddress);
  if (!balance) {
    balance = new Balances(walletAddress);
    balance.walletAddress = Address.fromHexString(walletAddress);
    balance.mHoprBalance = BigInt.fromI32(0);
    balance.wxHoprBalance = BigInt.fromI32(0);
    balance.xHoprBalance = BigInt.fromI32(0);
    balance.save()
  }
  return balance;
}
