import { BigInt } from "@graphprotocol/graph-ts";
import { Transfer } from "../generated/Contract/Contract";
import { ContractToken, ContractTokenBalance } from "../generated/schema";

export function handleTransfer(event: Transfer): void {
  let token = ContractToken.load(event.address.toHex());
  if (token == null) {
    token = new ContractToken(event.address.toHex());
    token.tokenAddress = event.address;
    token.save();
  }

  // Load or create a ContractTokenBalance entity for the sender (from) address
  let fromBalance = ContractTokenBalance.load(token.id + "-" + event.params.from.toHex());
  if (fromBalance == null) {
    fromBalance = new ContractTokenBalance(token.id + "-" + event.params.from.toHex());
    fromBalance.token = token.id;
    fromBalance.address = event.params.from;
    fromBalance.balance = BigInt.fromI32(0);
  }

  // Load or create a ContractTokenBalance entity for the recipient (to) address
  let toBalance = ContractTokenBalance.load(token.id + "-" + event.params.to.toHex());
  if (toBalance == null) {
    toBalance = new ContractTokenBalance(token.id + "-" + event.params.to.toHex());
    toBalance.token = token.id;
    toBalance.address = event.params.to;
    toBalance.balance = BigInt.fromI32(0);
  }

  // Update the balances based on the transfer event
  fromBalance.balance = fromBalance.balance.minus(event.params.value);
  toBalance.balance = toBalance.balance.plus(event.params.value);

  // Save the updated balances back to the store
  fromBalance.save();
  toBalance.save();
}