import { $$state } from '@benzed/immutable'
import { assign, namesOf } from '@benzed/util'

import { Module } from '../module'

//// Helper ////

type ModuleRecord = {
    [key: string]: Module
}

//// Helper ////

function getModuleRecord<T extends NodeTable<ModuleRecord>>(
    input: T
): T extends NodeTable<infer Tx> ? Tx : never {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return { ...input } as any
}

function setModuleRecord<T extends ModuleRecord>(table: NodeTable<T>, record: T): void {
    assign(table, record)
}

function* iterateModuleRecord<T extends ModuleRecord>(table: NodeTable<T>): Iterator<T[string]> {
    for (const name of namesOf(table)) {
        const module = table[name]
        yield module
    }
}

//// Main ////

class NodeTable<T extends ModuleRecord> extends Module implements Iterable<T[string]>{

    constructor(children: T) {
        super()
        this[$$state] = children
    }

    //// State ////

    get [$$state](): T {
        return getModuleRecord(this)
    }

    set [$$state](children: T) {
        setModuleRecord(this, children)
    }

    //// Iteration ////

    [Symbol.iterator](): Iterator<T[string]> {
        return iterateModuleRecord(this)
    }

}

//// Exports ////

export default NodeTable

export {
    NodeTable
}