import { DataSourceContext } from "@graphprotocol/graph-ts";
import { NewHoprNodeStakeModule, NewHoprNodeStakeSafe } from "../generated/NodeStakeFactory/NodeStakeFactory";
import { NodeManagementModule, Safe } from "../generated/templates";

export function handleNewSafe(event: NewHoprNodeStakeSafe): void {
    // start indexing the safe
    Safe.create(event.params.instance)
}

export function handleNewModule(event: NewHoprNodeStakeModule): void {
    let context = new DataSourceContext()
    context.setString('moduleImplementation', event.params.moduleImplementation.toHex())

    // start indexing the module
    NodeManagementModule.createWithContext(event.params.instance, context)
}