import { 
    callable, 
    ContextTransform, 
    Func, 
    Pipe, 
    ResolveAsyncOutput,
} from '@benzed/util'
    
import { Module } from '../module/module'
import type Node from '../node'

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
    @typescript-eslint/ban-types 
*/

//// Helper ////

export class ExecuteContext<D> extends Module<D> {

    constructor(private readonly _ref: { hasNode: boolean, node: Node }, data: D) {
        super(data)
    }

    // override the node properties so the context gets 
    // all the benefits of being in the tree without actually
    // being in the tree.
    override get hasNode() : boolean {
        return this._ref.hasNode
    }

    override get node(): Node {
        return this._ref.node
    }

}

//// Executable Module ////

export type ExecuteHook<I,O,D> = ContextTransform<I, O, ExecuteContext<D>>

export interface Execute<I = unknown, O = unknown, D = void> extends 
    Module<ContextTransform<I, O, D>>, 
    ContextTransform<I, O, D> {

    execute(input: I, data: D): O

    append<Ox>(hook: ExecuteHook<Awaited<O>, Ox, D>): Execute<I, ResolveAsyncOutput<O, Ox>, D>
    prepend<Ix>(hook: ExecuteHook<Ix, I, D>): Execute<Ix, O, D>

}

//// Executable Module ////

type ModuleConstructor = typeof Module

interface ExecuteConstructor extends ModuleConstructor {
    new <I,O,C = void>(execute: ExecuteHook<I,O,C>): Execute<I, O, C>
}

/**
 * Turns a module into a transform method, using a Module
 * instance with provided data as context.
 */
export const Execute: ExecuteConstructor = callable(
    function (input: any, data: any): any {
        return this.execute(input, data)
    },
    class extends Module<Func> {

        execute(input: any, data: any): any {
            const ctx = new ExecuteContext(this, data)
            return this.data(input, ctx)
        }

        append(execute: ContextTransform<any,any,any>): Execute<any, any, any> {
            return new Execute(Pipe.from(this.data).to(execute))
        }

        prepend(execute: ContextTransform<any,any,any>): Execute<any, any, any> {
            return new Execute(Pipe.from(execute).to(this.data))
        }

    },
    'Execute'
)

