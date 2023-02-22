import { 
    copy, 
    equals, 
    Stateful, 
    StructState,
    StructStateApply, 
    StructStatePath, 
    StructStateUpdate, 
    Structural 
} from '@benzed/immutable'

import { Each, Infer, isString, nil, omit, pick } from '@benzed/util'
import { AssertNode, FindNode, HasNode } from '../find'
import { NodePath } from '../path'

import { Node, PublicNode } from '../traits'

import NodeTable from './node-table'

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

interface NodeTableBuilder<R extends NodeRecord> extends PublicNode {

    pick<K extends (keyof R)[]>(...keys: K): NodeTable<_NodeRecordPick<R, K>>

    omit<K extends (keyof R)[]>(...keys: K): NodeTable<_NodeRecordOmit<R, K>>

    merge<Tx extends NodeRecord>(record: Tx): NodeTable<_NodeRecordMerge<R, Tx>>

    apply<K extends _K, Rv extends Node>(
        key: K, 
        record: Rv
    ): NodeTable<_NodeRecordSet<R, K, Rv>>

    apply<P extends StructStatePath>(...pathAndApply: [...P, StructStateApply<NodeTable<R>, P>]): NodeTable<R>

    update<K extends keyof R, F extends (input: R[K]) => Node>(
        key: K, 
        update: F
    ): NodeTable<_NodeRecordSet<R, K, ReturnType<F>>>

    update<P extends StructStatePath>(...pathAndUpdate: [...P, StructStateUpdate<NodeTable<R>, P>]): NodeTable<R>

    get<P extends StructStatePath>(...path: P): StructState<NodeTable<R>, P>

    copy(): NodeTable<R> 

    equals(other: unknown): other is NodeTable<R>

}

//// Main ////

// TODO FIXME HACK: Redo all this with a mutator:
// const NodeTableBuilder = class extends Traits.use(Mutator, PublicNode, PublicStructural) {
//      readonly [Mutator.target]
//      constructor(table) { super(); this[Mutator.target] = table }
//      pick()
//      omit()
//      merge()
// }

const NodeTableBuilder = class {

    get [Node.parent](): Node | nil {
        return this.table[Node.parent]
    }

    constructor(readonly table: NodeTable<NodeRecord>) { }

    // Table Build
    pick(...keys: PropertyKey[]): NodeTable<NodeRecord> {
        const record = copy(this.table[Stateful.key]) as any
        return new NodeTable(
            pick(record, ...keys) as NodeRecord
        )
    }

    omit(...keys: PropertyKey[]): NodeTable<NodeRecord> {
        const record = copy(this.table[Stateful.key]) as any
        return new NodeTable(
            omit(record, ...keys) as NodeRecord
        )
    }

    merge(newRecord: NodeRecord): NodeTable<NodeRecord> {
        const oldRecord = copy(this.table[Stateful.key]) as any
        return new NodeTable(
            {
                ...oldRecord,
                ...newRecord
            }
        )
    }

    // Struct Build
    apply(...args: any[]): NodeTable<NodeRecord> {
        return Structural.apply(
            this.table, 
            ...args as any
        ) as NodeTable<NodeRecord>
    }

    update(...args: any[]): NodeTable<NodeRecord> {
        return Structural.update(
            this.table, 
            ...args as any
        ) as NodeTable<NodeRecord>
    }

    get(...args: any[]): NodeTable<NodeRecord> {
        return Structural.getIn(
            this.table, 
            ...args as any
        ) as NodeTable<NodeRecord>
    }

    copy(): NodeTable<NodeRecord> {
        return copy(this.table)
    }

    equals(input: unknown): input is NodeTable<NodeRecord> {
        return equals(this.table, input)
    }

    // Public Node

    get name(): string {
        const name = Node.getPath(this.table).at(-1)
        return isString(name) 
            ? name 
            : this.table.constructor.name
    }

    get path(): NodePath {
        return Node.getPath(this.table)
    }

    get root(): Node {
        return Node.getRoot(this.table)
    }

    get parent(): Node | nil {
        return Node.getParent(this.table)
    }

    get children(): Node[] {
        return Array.from(this.eachChild())
    }

    get find(): FindNode {
        return Node.find(this.table)
    }

    get has(): HasNode {
        return Node.has(this.table)
    }

    get assert(): AssertNode {
        return Node.assert(this.table)
    }

    eachChild(): Each<Node> {
        return Node.eachChild(this.table)
    }

    eachParent(): Each<Node> {
        return Node.eachParent(this.table)
    }

    eachSibling(): Each<Node> {
        return Node.eachSibling(this.table)
    }

    eachAncestor(): Each<Node> {
        return Node.eachAncestor(this.table)
    }

    eachDescendent(): Each<Node> {
        return Node.eachDescendent(this.table)
    }

    eachNode(): Each<Node> {
        return Node.eachNode(this.table)
    }

} as unknown as new <R extends NodeRecord>(record: R) => NodeTableBuilder<R>

//// Exports ////

export default NodeTableBuilder

export {
    NodeTableBuilder
}