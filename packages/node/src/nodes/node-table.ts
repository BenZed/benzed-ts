import { Stateful, Structural } from '@benzed/immutable'
import { assign, Func, omit } from '@benzed/util'
import { Callable, Traits } from '@benzed/traits'

import { Node } from '../traits'

import { NodeTableBuilder } from './node-table-builder'

//// EsLint ////
/* eslint-disable 
    @typescript-eslint/no-explicit-any
*/

//// Types ////

type NodeRecord = {
    readonly [key: string]: Node
}

interface NodeTableProperties<T extends NodeRecord> extends NodeTableMethod<T>, Node, Structural {
    [Stateful.key]: T
}

type NodeTable<T extends NodeRecord> =
     & T 
     & NodeTableProperties<T>

interface NodeTableConstructor {
    new <T extends NodeRecord>(record: T): NodeTable<T>
}

interface NodeTableMethod<T extends NodeRecord> {
    <F extends (builder: NodeTableBuilder<T>) => NodeTable<any>>(update: F): ReturnType<F>
}

//// Helper ////

function updateTable(this: NodeTable<NodeRecord>, update: Func) {
    return update(new NodeTableBuilder(this as unknown as NodeRecord))
}

//// Main ////

/**
 * NodeTable is an immutable structure with a call signature providing an interface
 * for static updates.
 */
const NodeTable = class NodeTable extends Traits.use(Callable, Node, Structural) {

    constructor(children: NodeRecord) {
        super()
        this[Stateful.key] = children
    }

    get [Callable.signature]() {
        return updateTable
    }

    //// State ////

    get [Stateful.key](): NodeRecord {
        return { ...this } as unknown as NodeRecord
    }

    set [Stateful.key](record: NodeRecord) {
        assign(this, omit(record, Stateful.key))
    }

} as NodeTableConstructor

//// Exports ////

export default NodeTable

export {
    NodeTable
}