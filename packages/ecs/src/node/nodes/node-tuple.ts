import { assign } from '@benzed/util/src'
import { Node } from '../node'

//// Helper ////

type NodeTupleChildren = Node[] | readonly Node[]

//// Main ////

class NodeTuple<N extends NodeTupleChildren> extends Node {

    constructor(...children: N) {
        super()
        assign(this, children)
    }

}

//// Exports ////

export default NodeTuple

export {
    NodeTuple
}