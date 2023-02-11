import { Func } from '@benzed/util'
import { $$state } from '../state'

import { Children, eachChild, getChildren, Module } from '../module'

//// Types ////

/**
 * A Node is a Module with other modules as it's state
 */
interface Node extends Module, Iterable<Module> {

    get [$$state](): Children<this>
}

interface NodeConstructor {

    new (): Node
    new <F extends Func>(func: F): Node & F

}

//// Node ////

const Node = class Node extends Module {

    get [$$state](): object {
        return getChildren(this)
    }

    * [Symbol.iterator](): Iterator<Module> {
        yield* eachChild(this)
    }

} as NodeConstructor

//// Exports ////

export {
    Node,
    NodeConstructor,
}