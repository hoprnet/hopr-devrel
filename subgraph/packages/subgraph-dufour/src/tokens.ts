import { BigInt } from "@graphprotocol/graph-ts";
import { TokenType } from "./types";
import { getOrInitializeBalances } from "./helper";
import { Transfer as MHoprTransfer } from "../generated/mHoprToken/mHoprToken";
import { Transfer as WXHoprTransfer } from "../generated/wxHoprToken/wxHoprToken";
import { Transfer as XHoprTransfer } from "../generated/xHoprToken/xHoprToken";

/**
 * Handler for update mHOPR token balances
 * @param event mHOPR Token `Transfer` event
 */
export function handleMHoprTokenTransfer(event: MHoprTransfer): void {
    return handleErc20TokenTransfer(
        event.params.from.toHex(), 
        event.params.to.toHex(), 
        event.params.value,
        TokenType.MHOPR
    );
}

/**
 * Handler for update wxHOPR token balances
 * @param event wxHOPR Token `Transfer` event
 */
export function handleWXHoprTokenTransfer(event: WXHoprTransfer): void {
    return handleErc20TokenTransfer(
        event.params.from.toHex(), 
        event.params.to.toHex(), 
        event.params.value,
        TokenType.WXHOPR
    );
}

/**
 * Handler for update xHOPR token balances
 * @param event xHOPR Token `Transfer` event
 */
export function handleXHoprTokenTransfer(event: XHoprTransfer): void {
    return handleErc20TokenTransfer(
        event.params.from.toHex(), 
        event.params.to.toHex(), 
        event.params.value,
        TokenType.XHOPR
    );
}

/**
 * Basic handler for update ERC20 token balances
 * @param event Token `Transfer` event
 */
export function handleErc20TokenTransfer(
    fromAddress: string,
    toAddress: string,
    amount: BigInt,
    tokenType: TokenType
): void {
  // update balance for `fromAddress` account
  let fromWallet = getOrInitializeBalances(fromAddress)
  // update balance for `toAddress` account
  let toWallet = getOrInitializeBalances(toAddress);

  // Update the balances based on the transfer event
  if (amount.gt(BigInt.fromI32(0))) {
    switch (tokenType) {
        case TokenType.MHOPR:
            toWallet.mHoprBalance = toWallet.mHoprBalance.plus(amount);
            fromWallet.mHoprBalance = fromWallet.mHoprBalance.minus(amount);
            break;
        case TokenType.WXHOPR:
            toWallet.wxHoprBalance = toWallet.wxHoprBalance.plus(amount);
            fromWallet.wxHoprBalance = fromWallet.wxHoprBalance.minus(amount);
            break;
        case TokenType.XHOPR:
            toWallet.xHoprBalance = toWallet.xHoprBalance.plus(amount);
            fromWallet.xHoprBalance = fromWallet.xHoprBalance.minus(amount);
            break;
        default:
            break;
    }
  }

  // Save the updated balances back to the store
  fromWallet.save();
  toWallet.save();
}