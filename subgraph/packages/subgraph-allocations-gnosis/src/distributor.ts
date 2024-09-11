import { AllocationAdded, Claimed, OwnershipTransferred, RevokeAccountCall, ScheduleAdded } from "../generated/HoprDistributor/HoprDistributor";
import { Schedule, Allocation, Account } from "../generated/schema";
import { BigInt } from '@graphprotocol/graph-ts';

/**
 * Utility function to load or create a new account
 */ 
export function loadOrNewAccount(id: string): Account {
    let account = Account.load(id)
    if (!account) {
        account = new Account(id)
        account.allocatedAmount = BigInt.fromI32(0)
        account.claimedAmount = BigInt.fromI32(0)
    }

    return account
}

/**
 * Handler for AllocationAdded event
 * Create a new account, if it doesn't exist
 * Add a new allocation for the account on the schedule
 */ 
export function handleAllocationAdded(event: AllocationAdded): void {
    let schedule = Schedule.load(event.params.scheduleName)
    if (schedule == null) { return }

    let account = loadOrNewAccount(event.params.account.toHexString())
    account.allocatedAmount = account.allocatedAmount.plus(event.params.amount)
    account.save()

    let allocation = new Allocation(event.params.account.toHexString().concat(event.params.scheduleName))
    allocation.account = account.id
    allocation.amount = event.params.amount
    allocation.claimed = BigInt.fromI32(0)
    allocation.isRevoked = false

    allocation.schedule = schedule.id
    allocation.save()
}

/**
 * Handler for RevokeAccount call
 * Update the allocation to mark it as revoked. The allocation amount is not changed here.
 * Update the account to reduce the allocated amount by the unclaimed amount.
 */
export function handleRevokeAccount(call: RevokeAccountCall): void {
    // update allocation
    let allocation = Allocation.load(call.inputs.account.toHexString().concat(call.inputs.scheduleName))
    if (!allocation) { return }
    allocation.isRevoked = true
    // get the unclaimed amount
    let unclaimedAmount = allocation.amount.minus(allocation.claimed)
    allocation.save()

    // update the account
    let account = Account.load(call.inputs.account.toHexString())
    if (!account) { return }
    account.allocatedAmount = account.allocatedAmount.minus(unclaimedAmount)
    account.save()
}

/**
 * Handler for Claimed event
 * Update the allocation to increase the claimed amount
 * Update the account to increase the claimed amount
 */
export function handleClaimed(event: Claimed): void {
    let allocation = Allocation.load(event.params.account.toHexString().concat(event.params.scheduleName))
    if (!allocation) { return }

    allocation.claimed = allocation.claimed.plus(event.params.amount)
    allocation.save()

    // update account claimed amount
    let account = Account.load(event.params.account.toHexString())
    if (!account) { return }
    account.claimedAmount = account.claimedAmount.plus(event.params.amount)
    account.save()
}

/**
 * Handler for ScheduleAdded event
 * Create a new schedule with the given name and durations
 * The timestamps are calculated by adding the durations to the start time
 * The percents are stored as is
 */
export function handleScheduleAdded(event: ScheduleAdded): void {
    let schedule = new Schedule(event.params.name)
    // let startTime = BigInt.fromI32(1630065600)
    schedule.timestamps = event.params.durations.map<BigInt>((duration: BigInt): BigInt => duration.plus(BigInt.fromI32(1630065600)))
    schedule.percents = event.params.percents
    schedule.save()
}
