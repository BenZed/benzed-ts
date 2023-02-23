import {
    PublicStructural,
    Stateful,
    StructState,
    StructStateApply,
    StructStatePath,
    StructStateUpdate,
    Structural
} from '@benzed/immutable'
import { Traits } from '@benzed/traits'
import { assign, each, IndexesOf } from '@benzed/util'

import { Node, PublicNode } from '../traits'

import {

    addNodes,
    AddNodes,

    insertNodes,
    InsertNodes,

    removeNode,
    RemoveNode,

    swapNodes,
    SwapNodes,

    ApplyNode,
    UpdateNode,

    Nodes

} from './node-list-operations'

//// EsLint ////

/* eslint-disable
    @typescript-eslint/no-explicit-any
*/

//// Type ////

interface NodeListProperties<N extends Nodes> extends PublicNode, Structural {

    get<P extends StructStatePath>(...path: P): StructState<this, P>

    at<I extends IndexesOf<N>>(index: I): N[I]

    add<Nx extends Nodes>(...modules: Nx): NodeList<AddNodes<N,Nx>>

    insert<Nx extends Nodes, I extends IndexesOf<N>>(
        index: I, 
        ...modules: Nx
    ): NodeList<InsertNodes<N, I, Nx>>

    swap<I1 extends IndexesOf<N>, I2 extends IndexesOf<N>>(
        index1: I1,
        index2: I2
    ): NodeList<SwapNodes<N, I1, I2>>

    remove<I extends IndexesOf<N>>(index: I): NodeList<RemoveNode<N, I>>

    apply<I extends IndexesOf<N>, Nx extends Node>(
        index: I, 
        node: Nx
    ): NodeList<ApplyNode<N,I,Nx>>

    apply<P extends StructStatePath>(
        ...pathAndState: [...path: P, state: StructStateApply<this, P>]
    ): this

    update<I extends IndexesOf<N>, U extends (input: N[I]) => Node>(
        index: I, 
        update: U
    ): NodeList<UpdateNode<N,I,U>>

    update<P extends StructStatePath>(
        ...pathAndUpdate: [...path: P, state: StructStateUpdate<this, P>]
    ): this

    copy(): this

    equals(other: unknown): other is this

    get length(): N['length']

    get [Stateful.key](): N

}

type NodeListItems<N extends Nodes> = { readonly [K in IndexesOf<N>]: N[K] }

type NodeList<N extends Nodes> = 
    & Node 
    & NodeListProperties<N> 
    & NodeListItems<N>

interface NodeListConstructor {
    new <N extends Nodes>(...modules: N): NodeList<N>
}

//// Main ////

/**
 * Nodelist includes static builder methods for making typesafe changes to nodelist
 * sub-nodes.
 */
const NodeList = class NodeList<N extends Nodes> extends Traits.use(PublicNode, PublicStructural) {

    constructor(...children: N) {
        super()
        this[Stateful.key] = children
    }

    //// Builder Methods ////

    add<Nx extends Nodes>(...modules: Nx): NodeList<AddNodes<N,Nx>> {
        const added = addNodes(this[Stateful.key], ...modules)
        return new NodeList(...added)
    }

    insert<Nx extends Nodes, I extends IndexesOf<N>>(
        index: I, 
        ...modules: Nx
    ): NodeList<InsertNodes<N, I, Nx>> {
        const inserted = insertNodes(this[Stateful.key], index, ...modules)
        return new NodeList(...inserted)
    }

    swap<I1 extends IndexesOf<N>, I2 extends IndexesOf<N>>(
        index1: I1,
        index2: I2
    ): NodeList<SwapNodes<N, I1, I2>> {
        const swapped = swapNodes(this[Stateful.key], index1, index2)
        return new NodeList(...swapped)
    }

    remove<I extends IndexesOf<N>>(index: I): NodeList<RemoveNode<N, I>> {
        const removed = removeNode(this[Stateful.key], index)
        return new NodeList(...removed)
    }

    // type signature is different, but implementation doesn't need to be:
    // apply()
    // update()

    //// Convenience Methods ////

    at<I extends IndexesOf<N>>(index: I): N[I] {
        const module = this[Stateful.key][index]
        if (!module)
            throw new Error(`Index ${index} is invalid`)

        return module as N[I]
    }

    get length(): N['length'] {
        return each.nameOf(this).count
    }

    //// State ////

    get [Stateful.key](): N {
        return Array.from({
            ...this,
            length: this.length 
        }) as unknown as N
    }

    protected set [Stateful.key](children: N) {

        // normalize state object vs array
        
        const state = { ...children } as any
        const length = each.keyOf(state).count
        
        // deep apply
        
        for (let i = 0; i < length; i++) {
            const node = (this as any)[i]
            if (node) // module may not exist if we're here right after a copy
                state[i] = Structural.apply(node, state[i])
        }
        
        assign(this, state)
    }

    //// Iterate ////

    * [Symbol.iterator](): Iterator<N[number]> {
        yield* this[Stateful.key]
    }

} as unknown as NodeListConstructor

//// Exports ////

export default NodeList

export {
    NodeList
}