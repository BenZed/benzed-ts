import { Func, indexesOf, Mutable, namesOf, nil, omit } from '@benzed/util'

import { $$state, setState, State } from '../state'
import Struct, { copyWithoutState } from '../struct'

//// EsLint ////

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
*/

//// Helper Types ////

type ArrayMethodNames = keyof {
    [K in keyof Array<unknown> as Array<unknown>[K] extends Func ? K : never]: never
}

type ArrayParams<T, M extends ArrayMethodNames> = Parameters<Array<T>[M]>

// type ArrayReturns<T, M extends ArrayMethodNames> = ReturnType<Array<T>[M]>

//// Helper ////

const ArrayMethods = Array.prototype

function applyArrayState<
    T, 
    S extends ArrayStruct<T>, 
    M extends (this: ArrayLike<T>, ...args: any) => any>(
    struct: S,
    method: M,
    args: Parameters<M>,
    stateFromReturnValue = false
): S {

    // create an arraylike out of the struct state, adding a mutable length property
    const arrayLike = { ...struct, length: struct.length }

    // apply the method to the arrayLike
    const result = method.apply(arrayLike, args)

    // convert the array like back into a state
    const state = stateFromReturnValue 
        ? result
        : omit(arrayLike, 'length')

    // clone struct and apply state
    const clone = copyWithoutState(struct)
    setState(clone, state as State<S>)
    return clone
    
}

//// Main ////

/**
 * An ArrayStruct implements a subset of the Array's methods, with the caveat that
 * none of the methods mutate the original array.
 */
class ArrayStruct<T> extends Struct implements Iterable<T> {

    readonly [index: number]: T

    constructor(...items: T[]) {
        super()

        let index = 0
        for (const item of items) 
            (this as Mutable<this>)[index++] = item
    }

    //// Interface ////

    get length(): number {
        return namesOf.count(this)
    }

    at(index: number): T | nil {
        return this[
            index < 0 ? index + this.length : index
        ]
    }

    /**
     * Retreive a new array struct
     * with the given item pushed onto the end
     */
    push(...items: ArrayParams<T, 'push'>): this {
        return applyArrayState(this, ArrayMethods.push, items)
    }

    /**
     * Retreive a new array struct with
     * it's last item popped off
     */
    pop(): this {
        return applyArrayState(this, ArrayMethods.pop, [])
    }

    /**
     * Retreive a new array struct with shift parameters applied
     */
    shift(): this {
        return applyArrayState(this, ArrayMethods.shift, [])
    }

    /**
     * Retreive a new array struct with unshift parameters applied
     */
    unshift(): this {
        return applyArrayState(this, ArrayMethods.shift, [])
    }

    /**
     * Retrieve a new sorted array struct
     */
    sort(...sort: ArrayParams<T, 'sort'>): this {
        return applyArrayState(this, ArrayMethods.sort, sort)
    }

    /**
     * Retrieve a new reversed array struct
     */
    reverse(): this {
        return applyArrayState(this, ArrayMethods.reverse, [])
    }

    /**
     * Retrieve a new array struct with the splice arguments applied
     */
    splice(...splice: ArrayParams<T, 'splice'>): this {
        return applyArrayState(this, ArrayMethods.splice, splice)
    }

    /**
     * Retrieve a new reversed array struct with slice arguments applied
     */
    slice(...slice: ArrayParams<T, 'slice'>): this {
        return applyArrayState(this, ArrayMethods.slice, slice, true)
    }

    /**
     * Retrieve a new reversed array struct with map arguments applied
     */
    map(...map: ArrayParams<T, 'map'>): this {
        return applyArrayState(this, ArrayMethods.map, map, true)
    }

    /**
     * Retrieve a new reversed array struct with filter arguments applied
     */
    filter(...filter: ArrayParams<T, 'filter'>): this {
        return applyArrayState(this, ArrayMethods.filter, filter, true)
    }

    /**
     * Retrieve a new reversed array struct with concat arguments applied
     */
    concat(...concat: ArrayParams<T, 'concat'>): this {
        return applyArrayState(this, ArrayMethods.concat, concat, true)
    }

    /**
     * Retrieve a new reversed array struct with concat arguments applied
     */
    copyWithin(...copyWithin: ArrayParams<T, 'copyWithin'>): this {
        return applyArrayState(this, ArrayMethods.copyWithin, copyWithin)
    }

    /**
     * Retrieve a new reversed array struct with concat arguments applied
     */
    join(...join: ArrayParams<T, 'join'>): string {
        return ArrayMethods.join.apply(this, join)
    }

    // TODO reduce
    // TODO reduceRight
    // TODO entries
    // TODO values
    // TODO every
    // TODO some
    // TODO fill
    // TODO find
    // TODO findIndex
    // TODO findLast
    // TODO findLastIndex
    // TODO flat
    // TODO flatMap
    // TODO forEach
    // TODO includes
    // TODO indexOf
    // TODO keys
    // TODO lastIndexOf

    toArray(): T[] {
        return [...this]
    }

    //// Iterable ////
    
    *[Symbol.iterator](): Iterator<T> {
        for (const index of indexesOf(this))
            yield this[index]
    }

    //// State ////

    get [$$state](): { [index: number]: T } {
        return { ...this }
    }

}

//// Export ////

export default ArrayStruct

export {
    ArrayStruct
}