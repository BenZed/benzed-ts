import { assign } from '@benzed/util'
import { Node } from '../node'

//// Helper ////

type NodeRecordChildren = {
    [key: string]: Node
}

//// Main ////

/**
 * A node record is a node with properties that allow sub modules
 * to be immutably changed in a static manner
 */
class NodeRecord<N extends NodeRecordChildren> extends Node {

    constructor(children: N) {
        super()
        assign(this, children)
    }

}

//// Exports ////

export default NodeRecord

export {
    NodeRecord
}