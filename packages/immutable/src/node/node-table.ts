import { assign, Func, Infer } from '@benzed/util'

import { $$state } from '../state'

import { FindModule, AssertModule, HasModule, Module, ModuleFind, ModulePublic } from '../module'

//// EsLint ////
/* eslint-disable 
    @typescript-eslint/no-explicit-any,
*/

//// Helper ////

type _K = string | number | symbol

type _ModuleRecordPick<T extends ModuleRecord, K extends (keyof T)[]> = 
    Infer<{
        [Tk in keyof T as Tk extends K[number] ? Tk : never]: T[Tk]
    }, ModuleRecord>

type _ModuleRecordOmit<T extends ModuleRecord, K extends (keyof T)[]> = 
    Infer<{
        [Tk in keyof T as Tk extends K[number] ? never : Tk]: T[Tk]
    }, ModuleRecord>

type _ModuleRecordMerge<T extends ModuleRecord, Tx extends ModuleRecord> = 
    Infer<{
        [K in keyof T | keyof Tx]: K extends keyof Tx 
            ? Tx[K]
            : K extends keyof T 
                ? T[K]
                : never
    }, ModuleRecord>

type _ModuleRecordSet<T extends ModuleRecord, K extends _K, R extends Module> = 
    Infer<_ModuleRecordMerge<T, { [Kk in K]: R }>, ModuleRecord>

//// Types ////

type ModuleRecord = {
    readonly [key: string]: Module
}

interface NodeTableProperties<T extends ModuleRecord> extends NodeTableMethod<T>, Module {
    [$$state]: T
}

type NodeTable<T extends ModuleRecord> =
     & T 
     & NodeTableProperties<T>

interface NodeTableConstructor {
    new <T extends ModuleRecord>(record: T): NodeTable<T>
}

interface NodeTableMethodInterface<T extends ModuleRecord> extends ModulePublic {

    pick<K extends (keyof T)[]>(...keys: K): NodeTable<_ModuleRecordPick<T, K>>
    omit<K extends (keyof T)[]>(...keys: K): NodeTable<_ModuleRecordOmit<T, K>>
    merge<Tx extends ModuleRecord>(record: Tx): NodeTable<_ModuleRecordMerge<T, Tx>>

    set<K extends _K, R extends Module>(
        key: K, 
        record: R
    ): NodeTable<_ModuleRecordSet<T, K, R>>

    set<K extends keyof T, F extends (input: T[K]) => Module>(
        key: K, 
        update: F
    ): NodeTable<_ModuleRecordSet<T, K, ReturnType<F>>>
}

interface NodeTableMethod<T extends ModuleRecord> {
    <F extends (input: NodeTableMethodInterface<T>) => NodeTable<any>>(update: F): ReturnType<F>
}

//// Main ////

const NodeTable = class NodeTable extends Module<NodeTableMethod<ModuleRecord>> {

    constructor(children: ModuleRecord) {
        super(function (f: Func) {
            return f(this)
        })
        this[$$state] = children
    }

    //// State ////

    get [$$state](): ModuleRecord {
        return { ...this } as unknown as ModuleRecord
    }

    set [$$state](children: ModuleRecord) {
        assign(this, children)
    }

} as NodeTableConstructor

//// Exports ////

export default NodeTable

export {
    NodeTable
}