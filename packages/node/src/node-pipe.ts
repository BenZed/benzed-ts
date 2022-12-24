import { 
    callable, 
    ContextTransform, 
    Func, 
    Pipe, 
    ResolveAsyncOutput,
} from '@benzed/util'

import Node from './node'

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
    @typescript-eslint/ban-types 
*/

//// Context ////

export class NodeContext<V> extends Node<V> {

    constructor(private readonly _ref: { hasParent: boolean, parent: Node }, value: V) {
        super(value)
    }

    // override the parent properties so the context gets 
    // all the benefits of being in the tree without actually
    // being in the tree.
    override get hasParent() : boolean {
        return this._ref.hasParent
    }

    override get parent(): Node {
        return this._ref.parent
    }

}

//// NodePipe ////

export type NodeTransform<I,O,C> = ContextTransform<I, O, NodeContext<C>>

export interface NodePipe<I = unknown, O = unknown, C = void> extends Node<ContextTransform<I, O, C>>, ContextTransform<I, O, C> {

    append<Ox>(hook: NodeTransform<Awaited<O>, Ox, C>): NodePipe<I, ResolveAsyncOutput<O, Ox>, C>
    prepend<Ix>(hook: NodeTransform<Ix, I, C>): NodePipe<Ix, O, C>

}

//// NodePipeConstructo ////

type _NodeConstructor = typeof Node

interface NodePipeConstructor extends _NodeConstructor {
    new <I,O,C = void>(transform: NodeTransform<I,O,C>): NodePipe<I, O, C>
}

/**
 * Turns a module into a transform method, using a Module
 * instance with provided data as context.
 */
export const NodePipe: NodePipeConstructor = callable(
    function (input: any, data: any): any {
        const ctx = new NodeContext(this, data)
        return this.transform(input, ctx)
    },
    class extends Node<Func> {

        get transform(): Func {
            return this._value
        }

        append(transform: ContextTransform<any,any,any>): NodePipe<any, any, any> {
            return new NodePipe(Pipe.from(this.transform).to(transform))
        }

        prepend(transform: ContextTransform<any,any,any>): NodePipe<any, any, any> {
            return new NodePipe(Pipe.from(transform).to(this.transform))
        }

    },
    'NodePipe'
)

