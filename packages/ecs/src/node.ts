import { Func } from '@benzed/util'
import { $$state } from '@benzed/immutable'

import { 
    getChildren, 
    Module, 
    ModuleChildren 
} from './module'

//// Types ////

interface Node extends Module {

    get [$$state](): ModuleChildren<this>

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