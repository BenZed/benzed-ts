import { Func } from '@benzed/util'
import { $$state } from '@benzed/immutable'

import { Children, getChildren, Module } from '../module'

//// Types ////

/**
 * A Node is a Module with other modules as it's state
 */
interface Node extends Module {

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

} as NodeConstructor

//// Exports ////

export {
    Node,
    NodeConstructor,
}