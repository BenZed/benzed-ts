import { $$state } from '@benzed/immutable'
import { assign } from '@benzed/util'

import { Module } from '../module'

//// Helper ////

type ModuleArray = Module[]

//// Helper ////

function getModuleArray<T extends NodeList<ModuleArray>>(
    input: T
): T extends NodeList<infer Tx> ? Tx : never {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return { ...input } as any
}

function setModuleArray<T extends ModuleArray>(table: NodeList<T>, record: T): void {
    assign(table, record)
}

function* iterateModuleList<T extends ModuleArray>(table: NodeList<T>): Iterator<T[number]> {
    yield* getModuleArray(table)
}

//// Main ////

class NodeList<T extends ModuleArray> extends Module implements Iterable<T[number]>{

    constructor(...children: T) {
        super()
        this[$$state] = children
    }

    //// State ////

    get [$$state](): T {
        return getModuleArray(this)
    }

    set [$$state](children: T) {
        setModuleArray(this, children)
    }

    //// Iterate ////

    [Symbol.iterator](): Iterator<T[number]> {
        return iterateModuleList(this)
    }

}

//// Exports ////

export default NodeList

export {
    NodeList
}