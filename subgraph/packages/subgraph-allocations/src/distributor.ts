import { AllocationAdded, Claimed, OwnershipTransferred, ScheduleAdded } from "../generated/HoprDistributor/HoprDistributor";
import { Schedule, Allocation, Account } from "../generated/schema";
import { BigInt } from '@graphprotocol/graph-ts';

export function loadOrNewAccount(id: string): Account {
    let account = Account.load(id)
    if (!account) {
        account = new Account(id)
        account.allocatedAmount = BigInt.fromI32(0)
        account.claimedAmount = BigInt.fromI32(0)
        account.allocations = new Array<string>(0)
    }

    return account
}

export function handleAllocationAdded(event: AllocationAdded): void {
    let schedule = Schedule.load(event.params.scheduleName)
    if (schedule == null) { return }


    let allocation = new Allocation(event.params.account.toHexString().concat(event.params.scheduleName))
    allocation.account = event.params.account.toHexString()
    allocation.amount = event.params.amount
    allocation.claimed = BigInt.fromI32(0)
    allocation.schedule = event.params.scheduleName
    allocation.save()

    let account = loadOrNewAccount(event.params.account.toHexString())
    account.allocations.push(allocation.id)
    account.save()
}

export function handleClaimed(event: Claimed): void {
    let allocation = Allocation.load(event.params.account.toHexString().concat(event.params.scheduleName))
    if (!allocation) { return }

    allocation.claimed = allocation.claimed.plus(event.params.amount)
    allocation.save()
}

export function handleOwnershipTransferred(event: OwnershipTransferred): void {
    let srcAccount = Account.load(event.params.previousOwner.toHexString())
    if (!srcAccount) { return }

    let destAccount = loadOrNewAccount(event.params.newOwner.toHexString())
    destAccount.allocatedAmount = destAccount.allocatedAmount.plus(srcAccount.allocatedAmount)
    destAccount.claimedAmount = destAccount.claimedAmount.plus(srcAccount.claimedAmount)

    destAccount.allocations = new Array<string>(0)
    for (let idx = 0; idx < srcAccount.allocations.length; idx++) {
        var element = srcAccount.allocations[idx];
        destAccount.allocations.push(element)
    }


    srcAccount.allocatedAmount = BigInt.fromI32(0)
    srcAccount.claimedAmount = BigInt.fromI32(0)
    srcAccount.allocations = new Array<string>(0)

    srcAccount.save()
    destAccount.save()
}

export function handleScheduleAdded(event: ScheduleAdded): void {
    let startTime = BigInt.fromI32(1630065600)
    let schedule = new Schedule(event.params.name)
    schedule.timestamps = new Array<BigInt>(0)

    for (let idx = 0; idx < event.params.durations.length; idx++) {
        var element = event.params.durations[idx];
        schedule.timestamps.push(element.plus(startTime));
    }

    schedule.percents = event.params.percents
    schedule.save()
}
