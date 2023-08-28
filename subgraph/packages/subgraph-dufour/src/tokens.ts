import { Address, BigDecimal, BigInt } from "@graphprotocol/graph-ts";
import { TokenType } from "./types";
import { decimalBase, decreaseBalancesTrackerForSafes, getOrInitializeAllowance, getOrInitializeBalance, increaseBalancesTrackerForSafes } from "./helper";
import { Approval as MHoprApproval, Transfer as MHoprTransfer } from "../generated/mHoprToken/ERC20Token";
import { Approval as WXHoprApproval, Transfer as WXHoprTransfer } from "../generated/wxHoprToken/ERC20Token";
import { Approval as XHoprApproval, Transfer as XHoprTransfer } from "../generated/xHoprToken/ERC20Token";

/**
 * Handler for update mHOPR token balances
 * @param event mHOPR Token `Transfer` event
 */
export function handleMHoprTokenTransfer(event: MHoprTransfer): void {
    let amountInDecimal = event.params.value.divDecimal(decimalBase)
    handleErc20TokenTransferFrom(event.params.from, amountInDecimal, event.block.number, TokenType.MHOPR)
    handleErc20TokenTransferTo(event.params.to, amountInDecimal, event.block.number, TokenType.MHOPR)

    // add token balance to total tracker, if applicable
    increaseBalancesTrackerForSafes(event.params.to.toHex(), amountInDecimal, TokenType.MHOPR)
    decreaseBalancesTrackerForSafes(event.params.from.toHex(), amountInDecimal, TokenType.MHOPR)
}

/**
 * Handler for update wxHOPR token balances
 * @param event wxHOPR Token `Transfer` event
 */
export function handleWXHoprTokenTransfer(event: WXHoprTransfer): void {
    let amountInDecimal = event.params.value.divDecimal(decimalBase)
    handleErc20TokenTransferFrom(event.params.from, amountInDecimal, event.block.number, TokenType.WXHOPR)
    handleErc20TokenTransferTo(event.params.to, amountInDecimal, event.block.number, TokenType.WXHOPR)

    // add token balance to total tracker, if applicable
    increaseBalancesTrackerForSafes(event.params.to.toHex(), amountInDecimal, TokenType.WXHOPR)
    decreaseBalancesTrackerForSafes(event.params.from.toHex(), amountInDecimal, TokenType.WXHOPR)
}

/**
 * Handler for update xHOPR token balances
 * @param event xHOPR Token `Transfer` event
*/
export function handleXHoprTokenTransfer(event: XHoprTransfer): void {
    let amountInDecimal = event.params.value.divDecimal(decimalBase)
    handleErc20TokenTransferFrom(event.params.from, amountInDecimal, event.block.number, TokenType.XHOPR)
    handleErc20TokenTransferTo(event.params.to, amountInDecimal, event.block.number, TokenType.XHOPR)

    // add token balance to total tracker, if applicable
    increaseBalancesTrackerForSafes(event.params.to.toHex(), amountInDecimal, TokenType.XHOPR)
    decreaseBalancesTrackerForSafes(event.params.from.toHex(), amountInDecimal, TokenType.XHOPR)
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
  let fromAccountBalance = getOrInitializeBalance(fromAccount, blockNumber)
  if (fromAccountBalance.lastCompletedProcessedBlock.ge(blockNumber)) {
    // skip handling for fromAccount
    return
  }

  // handling fromAccount
  fromAccountBalance.lastCompletedProcessedBlock = blockNumber.minus(BigInt.fromI32(1))
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
  let toAccountBalance = getOrInitializeBalance(toAccount, blockNumber)
  if (toAccountBalance.lastCompletedProcessedBlock.ge(blockNumber)) {
    // skip handling for fromAccount
    return
  }

    // handling fromAccount
    toAccountBalance.lastCompletedProcessedBlock = blockNumber.minus(BigInt.fromI32(1))
    // Update the balances based on the transfer event
    // FIXME: TODO: Replace by
    //   toAccountBalance = increaseBalances(toAccountBalance, amount, tokenType)
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
  // Save the updated balances back to the store
  toAccountBalance.save();
}

/**
 * Handler for update mHOPR token approval
 * @param event mHOPR Token `Approval` event
 */
export function handleMHoprTokenApproval(event: MHoprApproval): void {
    let allowance = getOrInitializeAllowance(event.params.owner)
    allowance.mHoprAllowance = event.params.value.divDecimal(decimalBase)
    allowance.save()
}

/**
 * Handler for update wxHOPR token approval
 * @param event wxHOPR Token `Approval` event
 */
export function handleWXHoprTokenApproval(event: WXHoprApproval): void {
    let allowance = getOrInitializeAllowance(event.params.owner)
    allowance.wxHoprAllowance = event.params.value.divDecimal(decimalBase)
    allowance.save()
}

/**
 * Handler for update xHOPR token approval
 * @param event xHOPR Token `Approval` event
 */
export function handleXHoprTokenApproval(event: XHoprApproval): void {
    let allowance = getOrInitializeAllowance(event.params.owner)
    allowance.xHoprAllowance = event.params.value.divDecimal(decimalBase)
    allowance.save()
}