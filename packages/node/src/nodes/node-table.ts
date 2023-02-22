import { copy, PublicStructural, Stateful, StateOf, Structural } from '@benzed/immutable'
import { assign, Callable, Func, Infer, omit, pick } from '@benzed/util'
import { Traits } from '@benzed/traits'

import { Node, PublicNode } from '../traits'

//// EsLint ////
/* eslint-disable 
    @typescript-eslint/no-explicit-any,
*/

//// Helper ////

type _K = string | number | symbol

type _NodeRecordPick<T extends NodeRecord, K extends (keyof T)[]> = 
    Infer<{
        [Tk in keyof T as Tk extends K[number] ? Tk : never]: T[Tk]
    }, NodeRecord>

type _NodeRecordOmit<T extends NodeRecord, K extends (keyof T)[]> = 
    Infer<{
        [Tk in keyof T as Tk extends K[number] ? never : Tk]: T[Tk]
    }, NodeRecord>

type _NodeRecordMerge<T extends NodeRecord, Tx extends NodeRecord> = 
    Infer<{
        [K in keyof T | keyof Tx]: K extends keyof Tx 
            ? Tx[K]
            : K extends keyof T 
                ? T[K]
                : never
    }, NodeRecord>

type _NodeRecordSet<T extends NodeRecord, K extends _K, R extends Node> = 
    Infer<_NodeRecordMerge<T, { [Kk in K]: R }>, NodeRecord>

//// Types ////

type NodeRecord = {
    readonly [key: string]: Node
}

interface NodeTableProperties<T extends NodeRecord> extends NodeTableMethod<T>, Node {
    [Stateful.key]: T
}

type NodeTable<T extends NodeRecord> =
     & T 
     & NodeTableProperties<T>

interface NodeTableConstructor {
    new <T extends NodeRecord>(record: T): NodeTable<T>
}

interface NodeTableBuildInterface<T extends NodeRecord> extends PublicNode, Structural {

    pick<K extends (keyof T)[]>(...keys: K): NodeTable<_NodeRecordPick<T, K>>
    omit<K extends (keyof T)[]>(...keys: K): NodeTable<_NodeRecordOmit<T, K>>
    merge<Tx extends NodeRecord>(record: Tx): NodeTable<_NodeRecordMerge<T, Tx>>

    set<K extends _K, R extends Node>(
        key: K, 
        record: R
    ): NodeTable<_NodeRecordSet<T, K, R>>

    set<K extends keyof T, F extends (input: T[K]) => Node>(
        key: K, 
        update: F
    ): NodeTable<_NodeRecordSet<T, K, ReturnType<F>>>
}

interface NodeTableMethod<T extends NodeRecord> {
    <F extends (input: NodeTableBuildInterface<T>) => NodeTable<any>>(update: F): ReturnType<F>
}

//// Main ////

const NodeTable = class NodeTable extends Traits.add(Callable<Func>, PublicStructural, PublicNode) {

    constructor(children: NodeRecord) {
        super(function (this: unknown, f: Func) {
            return f(this)
        })
        this[Stateful.key] = children
    }

    //// Builder Methods ////

    pick(...keys: (keyof StateOf<this>)[]): this {
        const node = copy(this)
        node[Stateful.key] = pick(Stateful.get(this), ...keys)
        return node
    }

    omit(...keys: (keyof StateOf<this>)[]): this {
        const node = copy(this)
        node[Stateful.key] = omit(Stateful.get(this), ...keys)
        return node
    }

    merge(record: StateOf<this>): this {
        const node = copy(this)
        node[Stateful.key] = { ...Stateful.get(this), ...record }
        return node
    }

    //// State ////

    get [Stateful.key](): NodeRecord {
        return { ...this } as unknown as NodeRecord
    }

    set [Stateful.key](children: NodeRecord) {
        assign(this, omit(children, Stateful.key))
    }

} as NodeTableConstructor

//// Exports ////

export default NodeTable

export {
    NodeTable
}