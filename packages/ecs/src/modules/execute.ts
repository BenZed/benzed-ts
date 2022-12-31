import { 
    callable, 
    ContextTransform, 
    Func, 
    Pipe, 
    ResolveAsyncOutput,
} from '@benzed/util'
    
import { Module } from '../module/module'
import { AssertModule } from '../module/module-finder'
import { Node } from '../node'

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
    @typescript-eslint/ban-types 
*/

//// Helper ////

type ExecuteRef = { 
    get node(): Node
    get hasNode(): boolean
    get module(): AssertModule 
}

type ExecuteInput<I> = { input: I }

export type ExecuteContext<I, D extends object | void> = ExecuteRef & ExecuteInput<I> & D

//// Executable Module ////

export type ExecuteHook<I,O,D extends object | void> = ContextTransform<I, O, ExecuteContext<I, D>>

export interface Execute<I = unknown, O = unknown, D extends object | void = void> extends Module<ExecuteHook<I, O, D>>, ContextTransform<I, O, D> {
    execute(input: I, data: D): O
    appendHook<Ox>(hook: ExecuteHook<Awaited<O>, Ox, D>): Execute<I, ResolveAsyncOutput<O, Ox>, D>
    prependHook<Ix>(hook: ExecuteHook<Ix, I, D>): Execute<Ix, O, D>
}

//// Executable Module ////

type ModuleConstructor = typeof Module

interface ExecuteConstructor extends ModuleConstructor {
    new <I,O,D extends object | void = void>(execute: ExecuteHook<I,O,D>): Execute<I, O, D>
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

            const module = this

            const ctx: ExecuteContext<any,any> = {
                get node() {
                    return module.node
                },
                get hasNode() {
                    return module.hasNode
                },
                get module() {
                    return module.node.assertModule
                },
                input,
                ...data
            }

            const { data: transform } = module

            return transform.call(ctx, input, ctx)
        }

        appendHook(execute: ContextTransform<any,any,any>): Execute<any, any, any> {
            return new Execute(Pipe.from(this.data).to(execute))
        }

        prependHook(execute: ContextTransform<any,any,any>): Execute<any, any, any> {
            return new Execute(Pipe.from(execute).to(this.data))
        }

    },
    'Execute'
)
