import { Address, BigDecimal, BigInt } from "@graphprotocol/graph-ts";
import { TokenType } from "./types";
import { decimalBase, getOrInitializeBalances } from "./helper";
import { Transfer as MHoprTransfer } from "../generated/mHoprToken/mHoprToken";
import { Transfer as WXHoprTransfer } from "../generated/wxHoprToken/wxHoprToken";
import { Transfer as XHoprTransfer } from "../generated/xHoprToken/xHoprToken";

/**
 * Handler for update mHOPR token balances
 * @param event mHOPR Token `Transfer` event
 */
export function handleMHoprTokenTransfer(event: MHoprTransfer): void {
    // let amountInDecimal = event.params.value.divDecimal(decimalBase)
    // handleErc20TokenTransferFrom(event.params.from, amountInDecimal, event.block.number, TokenType.MHOPR)
    // handleErc20TokenTransferTo(event.params.to, amountInDecimal, event.block.number, TokenType.MHOPR)
}

/**
 * Handler for update wxHOPR token balances
 * @param event wxHOPR Token `Transfer` event
 */
export function handleWXHoprTokenTransfer(event: WXHoprTransfer): void {
    // let amountInDecimal = event.params.value.divDecimal(decimalBase)
    // handleErc20TokenTransferFrom(event.params.from, amountInDecimal, event.block.number, TokenType.WXHOPR)
    // handleErc20TokenTransferTo(event.params.to, amountInDecimal, event.block.number, TokenType.WXHOPR)
}

/**
 * Handler for update xHOPR token balances
 * @param event xHOPR Token `Transfer` event
*/
export function handleXHoprTokenTransfer(event: XHoprTransfer): void {
    // let amountInDecimal = event.params.value.divDecimal(decimalBase)
    // handleErc20TokenTransferFrom(event.params.from, amountInDecimal, event.block.number, TokenType.XHOPR)
    // handleErc20TokenTransferTo(event.params.to, amountInDecimal, event.block.number, TokenType.XHOPR)
}

/**
 * Basic handler for update ERC20 token balances for from account
 */
export function handleErc20TokenTransferFrom(
    fromAccount: Address,
    amount: BigDecimal,
    blockNumber: BigInt,
    tokenType: TokenType
): void {
  let fromAccountBalance = getOrInitializeBalances(fromAccount, blockNumber)
  if (fromAccountBalance.lastCompletedProcessedBlock.ge(blockNumber)) {
    // skip handling for fromAccount
    return
  }

  // handling fromAccount
  // Update the balances based on the transfer event
  if (amount.gt(BigDecimal.zero())) {
    switch (tokenType) {
        case TokenType.MHOPR:
            fromAccountBalance.mHoprBalance = fromAccountBalance.mHoprBalance.minus(amount);
            break;
        case TokenType.WXHOPR:
            fromAccountBalance.wxHoprBalance = fromAccountBalance.wxHoprBalance.minus(amount);
            break;
        case TokenType.XHOPR:
            fromAccountBalance.xHoprBalance = fromAccountBalance.xHoprBalance.minus(amount);
            break;
        default:
            break;
    }
  }

  fromAccountBalance.lastCompletedProcessedBlock = blockNumber.minus(BigInt.fromI32(1))
  // Save the updated balances back to the store
  fromAccountBalance.save();
}

/**
 * Basic handler for update ERC20 token balances for to account
 */
export function handleErc20TokenTransferTo(
    toAccount: Address,
    amount: BigDecimal,
    blockNumber: BigInt,
    tokenType: TokenType
): void {
  let toAccountBalance = getOrInitializeBalances(toAccount, blockNumber)
  if (toAccountBalance.lastCompletedProcessedBlock.ge(blockNumber)) {
    // skip handling for fromAccount
    return
  }

  // handling fromAccount
  // Update the balances based on the transfer event
  if (amount.gt(BigDecimal.zero())) {
    switch (tokenType) {
        case TokenType.MHOPR:
            toAccountBalance.mHoprBalance = toAccountBalance.mHoprBalance.plus(amount);
            break;
        case TokenType.WXHOPR:
            toAccountBalance.wxHoprBalance = toAccountBalance.wxHoprBalance.plus(amount);
            break;
        case TokenType.XHOPR:
            toAccountBalance.xHoprBalance = toAccountBalance.xHoprBalance.plus(amount);
            break;
        default:
            break;
    }
  }

  toAccountBalance.lastCompletedProcessedBlock = blockNumber.minus(BigInt.fromI32(1))
  // Save the updated balances back to the store
  toAccountBalance.save();
}