import { Empty, Func, isIntersection, isRecordOf, isShape, TypeGuard } from '@benzed/util'
import { $$state, getShallowState, StateFul } from '../state'

import { Children, eachChild, getChildren, isModule, Module } from '../module'
import equals, { $$equals } from '../equals'

//// Types ////

type NodeState = {
    [key: string | number | symbol]: Module
}

type NodeChildren<T> = T extends StateFul<infer S> 
    ? S extends NodeState 
        ? S 
        : Empty 
    : Empty

/**
 * A Node is a Module with other modules as it's state
 */
interface Node extends Module, Iterable<Module> {
    get [$$state](): Children<this>
}

interface NodeConstructor {

    readonly is: typeof isNode

    new (): Module
    new <F extends Func>(func: F): Node & F

}

//// Helper ////

const isNode = 
    isIntersection(
        isModule, 
        isShape({
            [$$state]: isRecordOf(isModule)
        })
    ) as TypeGuard<Node>

const isNodeEqual = <N extends Node = Node>(a: N, b: unknown): b is N => 
    isNode(b) && equals(getShallowState(a), getShallowState(b))

//// Node ////

abstract class Nodular extends Module {

    static override is = isNode

    override [$$equals](other: unknown): other is this {
        return isNodeEqual(this, other)
    }

    abstract get [$$state](): NodeState

    * [Symbol.iterator](): Iterator<Module> {
        yield* eachChild(this)
    }

}

const Node = class Node extends Nodular {

    get [$$state](): Children<this> {
        return getChildren(this)
    }

} as NodeConstructor

//// Exports ////

export {
    Node,
    Nodular,
    NodeConstructor,
}