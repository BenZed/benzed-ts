import { 
    callable, 
    ContextTransform, 
    Func, 
    Pipe, 
    ResolveAsyncOutput,
} from '@benzed/util'
    
import { Module } from '../module'
import Modules from './modules'

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
    @typescript-eslint/ban-types 
*/

//// Helper ////

export class ExecuteContext<D> extends Module<D> {

    constructor(private readonly _ref: { hasParent: boolean, parent: Modules }, data: D) {
        super(data)
    }

    // override the parent properties so the context gets 
    // all the benefits of being in the tree without actually
    // being in the tree.
    override get hasParent() : boolean {
        return this._ref.hasParent
    }

    override get parent(): Modules {
        return this._ref.parent
    }

}

//// Executable Module ////

export interface Execute<I = unknown, O = unknown, C = void> extends 
    Module<ContextTransform<I, O, C>>, 
    ContextTransform<I, O, C> {

    append<Ox>(execute: ContextTransform<Awaited<O>, Ox, C>): Execute<I, ResolveAsyncOutput<O, Ox>, C>

    prepend<Ix>(execute: ContextTransform<Ix, I, C>): Execute<Ix, ResolveAsyncOutput<Ix, O>, C>

}

//// Executable Module ////

interface ExecuteConstructor {
    new <I,O,C = void>(execute: ContextTransform<I, O, ExecuteContext<C>>): Execute<I, O, C>
}

/**
 * Turns a module into a transform method, using a Module
 * instance with provided data as context.
 */
export const Execute: ExecuteConstructor = callable(
    function (input: any, data: any): any {
        const ctx = new ExecuteContext(this, data)
        return this.data(input, ctx)
    },
    class extends Module<Func> {

        append(execute: ContextTransform<any,any,any>): Execute<any, any, any> {
            return new Execute(Pipe.from(this.data).to(execute))
        }

        prepend(execute: ContextTransform<any,any,any>): Execute<any, any, any> {
            return new Execute(Pipe.from(execute).to(this.data))
        }

    },
    'Execute'
)

