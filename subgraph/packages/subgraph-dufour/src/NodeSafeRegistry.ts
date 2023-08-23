import { DergisteredNodeSafe, RegisteredNodeSafe } from "../generated/NodeSafeRegistry/NodeSafeRegistry"
import { Dergistered, Registered } from "../generated/schema"

export function handleDergisteredNodeSafe(event: DergisteredNodeSafe): void {
  let entity = new Dergistered(
    event.transaction.hash.concatI32(event.logIndex.toI32()).toString()
  );
  entity.safeAddress = event.params.safeAddress;
  entity.nodeAddress = event.params.nodeAddress;
  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;
  entity.save();
}

export function handleRegisteredNodeSafe(event: RegisteredNodeSafe): void {
  let entity = new Registered(
    event.transaction.hash.concatI32(event.logIndex.toI32()).toString()
  );
  entity.safeAddress = event.params.safeAddress;
  entity.nodeAddress = event.params.nodeAddress;
  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;
  entity.save();
}






