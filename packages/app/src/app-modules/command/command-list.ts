import { Node, Nodes } from '@benzed/ecs'
import { Empty, Infer, isEmpty, iterate, KeysOf } from '@benzed/util'
import Command from './command'

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
*/

//// Helper Types ////

type _Command = Command<any,any,any>

type _OmitEmptyValues<T> = Infer<{
    [K in keyof T as T[K] extends Empty ? never : K]: T[K]
}>

type _CommandsInNodes<N extends Nodes> = _OmitEmptyValues<{
    [K in KeysOf<N>]: N[K] extends _Command
        ? N[K]
        : N[K] extends Node<any, infer Nx> 
            ? _CommandsInNodes<Nx>
            : never
}>

//// Types ////

type CommandList<N extends Nodes> = 
    _CommandsInNodes<N>

//// Main ////

/**
 * Create a typesafe list of commands of a node
 */
function commandList<N extends Nodes>(
    node: { nodes: N }
): CommandList<N> {

    const commands: Record<string, unknown> = {}

    for (const child of iterate(node.nodes)) {
        const command = Command.isCommand(child) ? child : commandList(child)
        if (!isEmpty(command))
            commands[child.name] = command
    }

    return commands as CommandList<N>
}

//// Exports ////

export default commandList

export {
    commandList,
    CommandList
}