import { BigInt } from "@graphprotocol/graph-ts";
import { Transfer } from "../generated/wxHoprToken/wxHoprToken";
import { AccountBalance } from "../generated/schema";

export const getOrInitializeAccountBalance = (accountAddress: string): AccountBalance => {
  let account = AccountBalance.load(accountAddress);
  if (!account) {
    account = new AccountBalance(accountAddress);
    account.wxHOPRbalance = BigInt.fromI32(0);
    account.mHOPRbalance = BigInt.fromI32(0);
    account.save()
  }
  return account;
}

export function handleTransfer_wxHopr(event: Transfer): void {
  // update balance for `from` account
  let fromAccount = getOrInitializeAccountBalance(event.params.from.toHex());
  // update balance for `to` account
  let toAccount = getOrInitializeAccountBalance(event.params.to.toHex());

  // Update the balances based on the transfer event
  let value = event.params.value;
  if (value.gt(BigInt.fromI32(0))) {
    toAccount.wxHOPRbalance = toAccount.wxHOPRbalance.plus(value);
    fromAccount.wxHOPRbalance = fromAccount.wxHOPRbalance.minus(value);
  }

  // Save the updated balances back to the store
  fromAccount.save();
  toAccount.save();
}