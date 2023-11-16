import { Transfer as WXHoprTransfer } from "../generated/wxHoprToken/ERC20Token";
import { Transaction } from "../generated/schema";
import { decimalBase } from "./helper";

/**
 * Handler to process `Transfer` events emitted by the `wxHoprToken` contract.
 * @param event wxHOPR Token `Transfer` event
 */
export function handleWXHoprTokenTransfer(event: WXHoprTransfer): void {
    /**
     * Create a new `Transaction` entity to store the details of the transaction.
     * The transaction hash is used as the entity ID.
     */

    // generation unique id randmoly
    let transaction = new Transaction(
        event.transaction.hash.toHex() + "-" + event.logIndex.toString()
    )

    transaction.txHash = event.transaction.hash.toHexString()
    transaction.from = event.params.from.toHexString()
    transaction.to = event.params.to.toHexString()
    transaction.amount = event.params.value.divDecimal(decimalBase)

    transaction.save()
}