import { assign } from '@benzed/util'

import { $$state } from '../state'

import { Module } from '../module'

//// Types ////

type ModuleRecord = {
    readonly [key: string]: Module
}

type NodeTable<T extends ModuleRecord> =
     Module & T

interface NodeTableConstructor {
    new <T extends ModuleRecord>(record: T): NodeTable<T>
}

//// Main ////

const NodeTable = class NodeTable extends Module {

    constructor(children: ModuleRecord) {
        super()
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