import { Stateful, Structural } from '@benzed/immutable'
import { assign, Callable, Func, omit } from '@benzed/util'
import { Traits } from '@benzed/traits'

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

//// Main ////

/**
 * NodeTable is an immutable structure with a call signature providing an interface
 * for static updates.
 */
const NodeTable = class NodeTable extends Traits.add(Callable<Func>, Node, Structural) {

    constructor(children: NodeRecord) {
        super(function updateTable(this: NodeTable, update: Func) {
            return update(new NodeTableBuilder(this as unknown as NodeRecord))
        })
        this[Stateful.key] = children
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