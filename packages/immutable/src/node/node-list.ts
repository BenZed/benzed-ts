import { assign, IndexesOf, keysOf } from '@benzed/util'

import { $$state, applyState } from '../state'

import { Module } from '../module'
import { 
    addModules, 
    AddModules, 

    insertModules, 
    InsertModules, 

    removeModule, 
    RemoveModule, 

    swapModules, 
    SwapModules,

    setModule,
    SetModule,

    Modules
} from './node-list-operations'

//// EsLint ////
/* eslint-disable 
    @typescript-eslint/no-explicit-any
*/

//// Main ////

class NodeList<M extends Modules> extends Module implements Iterable<M[number]>{

    constructor(...children: M) {
        super()
        this[$$state] = children
    }

    //// Builder Methods ////
    
    add<Mx extends Modules>(...modules: Mx): NodeList<AddModules<M,Mx>> {
        const added = addModules(this[$$state], ...modules)
        return new NodeList(...added)
    }

    insert<Mx extends Modules, I extends IndexesOf<M>>(
        index: I, 
        ...modules: Mx
    ): NodeList<InsertModules<M, I, Mx>> {
        const inserted = insertModules(this[$$state], index, ...modules)
        return new NodeList(...inserted)
    }

    swap<I1 extends IndexesOf<M>, I2 extends IndexesOf<M>>(
        index1: I1,
        index2: I2
    ): NodeList<SwapModules<M, I1, I2>> {
        const swapped = swapModules(this[$$state], index1, index2)
        return new NodeList(...swapped)
    }

    remove<I extends IndexesOf<M>>(index: I): NodeList<RemoveModule<M, I>> {
        const removed = removeModule(this[$$state], index)
        return new NodeList(...removed)
    }

    set<
        I extends IndexesOf<M>,
        Mx extends Module,
    >(
        index: I,
        module: Mx
    ): NodeList<SetModule<M, I, Mx>>

    set<
        I extends IndexesOf<M>,
        F extends (input: M[I]) => Module
    >(
        index: I,
        update: F
    ): NodeList<SetModule<M,I,F>>

    set(i: number, updateOrModule: unknown): unknown {

        const updated = setModule(
            this[$$state], 
            i as IndexesOf<M>,
            updateOrModule as Module
        )

        return new NodeList(...updated)
    }

    //// Convenience Methods ////

    at<I extends IndexesOf<M>>(index: I): M[I] {
        const module = this[$$state][index]
        if (!module)
            throw new Error(`Index ${index} is invalid`)

        return module as M[I]
    }
    
    get length(): M['length'] {
        return this[$$state].length
    }

    //// State ////

    get [$$state](): M {
        return Array.from({
            ...this, 
            length: keysOf.count(this) 
        }) as unknown as M
    }

    set [$$state](children: M) {

        // normalize state object vs array
        const state = { ...children } as any
        const length = keysOf.count(state)

        // deep apply
        for (let i = 0; i < length; i++) {
            const module = (this as any)[i]
            if (module) // module may not exist if we're here right after a copy
                state[i] = applyState(module, state[i])
        }

        assign(this, state)
    }

    //// Iterate ////

    * [Symbol.iterator](): Iterator<M[number]> {
        yield* this[$$state]
    }

}

//// Exports ////

export default NodeList

export {
    NodeList
}