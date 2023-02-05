import { 
    assign, 
    Func, 
    nil, 
    provideCallableContext, 
    Callable, 
    isFunc, 
    Property,
    Empty,
    keysOf,
    symbolsOf
} from '@benzed/util'

import { $$copy } from './copy'
import { equals, $$equals } from './equals'

//// EsLint ////
/* eslint-disable 
    @typescript-eslint/no-explicit-any
*/

//// Symbols ////

const $$state = Symbol('state')

//// Types ////

type StructState<T extends Struct> = T extends StatefulStruct<infer S> ? S : Empty

type StatefulStruct<T extends object> = {
    get [$$state](): T
}

type Struct = Structural

interface StructConstructor {
    new (): Struct
    new <F extends Func>(signature: F): Struct & F
}

//// Helper ////

function applySignature<T extends Struct>(struct: T, signature?: Func): T {

    return signature 
        ? Callable.create(signature, struct, provideCallableContext) as T
        : struct
}

function getStateDescriptor<T extends Struct>(struct: T): PropertyDescriptor | nil {
    return Property.descriptorOf(struct, $$state)
}

function setKeyEnumerable<T extends Struct>(struct: T, enumerable: boolean, stateKeys: (keyof T)[]): void {

    const state = getState(struct)

    for (const stateKey of stateKeys as (string | symbol)[]) {

        if (!enumerable && stateKey in state === false)
            throw new Error(`${String(stateKey)} is not a valid key in struct ${struct}`)

        const description = Property
            .descriptorOf(struct, stateKey) ?? 
            { writable: true, configurable: true }

        Property.define(
            struct,
            stateKey,
            {
                ...description,
                enumerable
            }
        )
    }

}

//// Utility ////

function matchKeyVisibility<T extends Struct>(source: T, target: T): void {

    const state = getState(source)

    for (const stateKey of [...keysOf(state), ...symbolsOf(state)]) {

        const aDescriptor = Property.descriptorOf(source, stateKey)
        if (!aDescriptor)
            throw new Error(`${String(stateKey)} is not a valid key in struct ${source}`)

        const { enumerable } = aDescriptor

        setKeyEnumerable(target, enumerable ?? true, [stateKey as unknown as keyof T])
    }
}

/**
 * Turn on enumerability of the provided struct keys.
 */
function showStateKeys<T extends Struct>(struct: T, ...keys: (keyof StructState<T>)[]): void {
    setKeyEnumerable(struct, true, keys as (keyof T)[])
}

/**
 * Turn off enumerability of the provided struct keys.
 */
function hideNonStateKeys<T extends Struct>(struct: T, ...keys: (string | symbol)[]): void {
    setKeyEnumerable(struct, false, keys as (keyof T)[])
}

/**
 * Retreive the state of a struct.
 */
function getState<T extends Struct>(struct: T): StructState<T> {

    const stateDescriptor = getStateDescriptor(struct)

    return (
        stateDescriptor && (stateDescriptor.value || stateDescriptor.get)
            ? (struct as any)[$$state]
            : { ...struct }
    )
}

/**
 * Over-write the state of a struct without creating a copy of it.
 */
function setState<T extends Struct>(struct: T, state: StructState<T>): void {

    const stateDescriptor = getStateDescriptor(struct)

    if (stateDescriptor?.writable || stateDescriptor?.set)
        (struct as any)[$$state] = state
    else
        assign(struct, state)

}

/**
 * Given a struct and state, receive a new struct with the state applied.
 */
function applyState<T extends Struct>(struct: T, state: Partial<StructState<T>>): T {

    const newStruct = copyWithoutState(struct)

    const previousState = getState(struct)

    setState(newStruct, { ...previousState, ...state })

    matchKeyVisibility(struct, newStruct)

    return newStruct
}

/**
 * Create a clone of a struct without applying any state
 */
function copyWithoutState<T extends Struct>(struct: T): T {
    
    const newStruct = Object.create(struct.constructor.prototype)

    const signature = isFunc(struct)
        ? Callable.signatureOf(struct)
        : nil 

    return applySignature(newStruct, signature)
}

//// Implementation ////

abstract class Structural {

    static [Symbol.hasInstance] = Callable[Symbol.hasInstance]

    constructor(signature?: Func) {
        return applySignature(this, signature)
    }

    protected [$$copy](): this {
        return applyState(this, getState(this))
    }
    
    protected [$$equals](other: unknown): other is this {
        return (
            other instanceof Struct && 
            other.constructor === this.constructor &&
            equals(
                getState(this),
                getState(other)
            )
        )
    }
}

const Struct = class Struct extends Structural {

} as StructConstructor

//// Exports ////

export default Struct

export {

    Struct,
    StructState,
    StatefulStruct,

    $$state,

    getState,
    setState,
    applyState,
    copyWithoutState,
    showStateKeys,
    hideNonStateKeys,
    matchKeyVisibility
}