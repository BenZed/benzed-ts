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
    symbolsOf,
    Infer,
    GenericObject as State
} from '@benzed/util'

import { $$copy } from './copy'
import { equals, $$equals } from './equals'

//// EsLint ////
/* eslint-disable 
    @typescript-eslint/no-explicit-any,
    @typescript-eslint/ban-types
*/

//// Symbols ////

const $$state = Symbol('state')

//// Helper Types ////

type _StructState<T extends State> = Infer<{
    [K in keyof T]: T[K] extends Struct 
        ? StructState<T[K]>
        : T[K]
}, State>

type _StructStateApply<T extends State> = Partial<{
    [K in keyof T]: T[K] extends Struct 
        ? StructStateApply<T[K]>
        : T[K]
}>

//// Types ////

type StructState<T extends Struct> = T extends StatefulStruct<infer S> 
    ? _StructState<S> 
    : Empty

type StructStateApply<T extends Struct> = T extends StatefulStruct<infer S> 
    ? _StructStateApply<S> 
    : Empty

type StatefulStruct<T extends State> = {
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

    const state = getShallowState(struct)

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

function getState<T extends Struct>(struct: T, deep: boolean): StructState<T> {

    const stateDescriptor = getStateDescriptor(struct)

    const state = stateDescriptor && (stateDescriptor.value || stateDescriptor.get)
        ? (struct as any)[$$state]
        : { ...struct }

    if (deep) {
        for (const key of keysOf(state)) {
            if (state[key] instanceof Struct) 
                state[key] = getState(state[key], deep)
        }
    }

    return state
}

function getShallowState<T extends Struct>(struct: T): StructState<T> {
    return getState(struct, false)
}

//// Utility ////

function matchKeyVisibility<T extends Struct>(source: T, target: T): void {

    const state = getShallowState(source)

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
 * Retreive the deep state of a struct.
 */
function getDeepState<T extends Struct>(struct: T): StructState<T> {
    return getState(struct, true)
}

/**
 * Over-write the state of a struct without creating a copy of it.
 */
function setState<T extends Struct>(struct: T, state: StructState<T>): void {

    const stateDescriptor = getStateDescriptor(struct)

    if (stateDescriptor?.writable || stateDescriptor?.set)
        (struct as any)[$$state] = state

    else {
        for (const key of keysOf(state)) {
            const structKey = key as unknown as keyof typeof struct
            const structValue = struct[structKey] as unknown
            const stateValue = state[key] as unknown
            if (
                !(stateValue instanceof Struct) && 
                structValue instanceof Struct
            ) {
                state[key] = applyState(
                    structValue, 
                    stateValue as object
                )
            }
        }
        assign(struct, state)
    }

}

/**
 * Given a struct and state, receive a new struct with the state applied.
 */
function applyState<T extends Struct>(struct: T, state: StructStateApply<T>): T {

    const previousState = getShallowState(struct)

    const newStruct = copyWithoutState(struct)
    // first apply old state, in case of nested structs
    setState(newStruct, previousState)

    // apply state again, mixedm so that any nested structs 
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
        return applyState(this, getShallowState(this))
    }
    
    protected [$$equals](other: unknown): other is this {
        return (
            other instanceof Struct && 
            other.constructor === this.constructor &&
            equals(
                getShallowState(this),
                getShallowState(other)
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
    StructStateApply,
    StatefulStruct,

    $$state,
    State,

    getDeepState as getState,
    getShallowState,
    setState,
    applyState,
    copyWithoutState,
    showStateKeys,
    hideNonStateKeys,
    matchKeyVisibility
}