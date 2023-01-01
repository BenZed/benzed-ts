import { Modules, Node, Nodes } from '@benzed/ecs'
import { Empty, Infer, isEmpty, KeysOf } from '@benzed/util'
import Command from './command'

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
*/

//// Helper Types ////

type _Command = Command<any,any,any>

export type _OmitEmptyValues<T> = Infer<{
    [K in keyof T as T[K] extends Empty ? never : K]: T[K]
}>

type _CommandsOfNodes<N extends Nodes> = _OmitEmptyValues<{
    [K in KeysOf<N>]: N[K] extends Node<infer M, infer Nx> 
        ? _CommandList<M, Nx>
        : never
}>

type _CommandInModules<M> = M extends [infer M1, ...infer Mx]
    ? M1 extends _Command
        ? M1
        : _CommandInModules<Mx>
    : never

type _CommandList<M extends Modules, N extends Nodes> = 
    _CommandInModules<M> extends never
        ? _CommandsOfNodes<N>
        : _CommandInModules<M>
    
//// Types ////

type CommandList<M extends Modules, N extends Nodes> = 
    _CommandList<M,N>

//// Main ////

/**
 * Create a typesafe list of commands of a node
 */
function commandList<M extends Modules, N extends Nodes>(
    node: Node<M,N>
): CommandList<M,N> {

    const commands: Record<string, unknown> = {}

    for (const child of node) {
        const command: unknown = child.findModule(Command) ?? commandList(child)
        if (!isEmpty(command))
            commands[child.name] = command
    }

    return commands as CommandList<M,N>
}

//// Exports ////

export default commandList

export {
    commandList,
    CommandList
}