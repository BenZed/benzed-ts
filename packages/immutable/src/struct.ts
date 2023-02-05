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
    GenericObject as State,
    KeysOf,
    omit,
    isObject
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

type _StructState<T extends object> = Infer<{
    [K in Exclude<keyof T, typeof $$state>]: T[K] extends Struct 
        ? StructState<T[K]>
        : T[K]
}, State>

type _StructStateApply<T extends object> = Partial<{
    [K in Exclude<keyof T, typeof $$state>]: T[K] extends Struct 
        ? StructStateApply<T[K]>
        : T[K]
}>

type _StructDeepPaths<T extends object> = {
    [K in keyof T]: T[K] extends object 
        ? [K] | [K, ..._StructDeepPaths<T[K]>]
        : [K]
}[keyof T]

type _StructStateAtPath<T extends object, P> = P extends [infer P1, ...infer Pr]    
    ? P1 extends keyof T 
        ? T[P1] extends object 
            ? Pr extends []
                ? _StructState<T[P1]>
                : _StructStateAtPath<T[P1], Pr>
            : T[P1]
        : _StructState<T>
    : never

interface _StateFul<T extends object> {
    get [$$state](): T
}

//// Types ////

type StructState<T extends Struct> = T extends _StateFul<infer S> 
    ? _StructState<S> 
    : Empty

type StructStateApply<T extends Struct> = T extends _StateFul<infer S> 
    ? _StructStateApply<S> 
    : Empty

type StructDeepPaths<T extends Struct> = _StructDeepPaths<StructState<T>>

type StructDeepStateApply<T extends Struct, P extends StructDeepPaths<T>> = 
    [...keys: P, state: _StructStateAtPath<T, P>]

interface StatefulStruct<T extends State> extends _StateFul<T> {}

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
function applyState<T extends Struct>(struct: T, state: StructStateApply<T>): T 
function applyState<T extends Struct, P extends StructDeepPaths<T>>(
    struct: T, 
    ...deepState: StructDeepStateApply<T, P>
): T 
function applyState(struct: Struct, ...args: unknown[]): Struct {

    const previousState = getShallowState(struct)
    const newStruct = copyWithoutState(struct)
    // first apply old state, in case of nested structs
    setState(newStruct, previousState)

    // Nest state if it is being deeply set
    let state = args.pop()
    const deepKeys = args.reverse() as (keyof Struct)[]
    for (const deepKey of deepKeys) 
        state = { [deepKey]: state }

    // apply state again, mixed so that any nested structs
    if (isObject(state)) 
        setState(newStruct, { ...previousState, ...state as object })
    else 
        throw new Error('Scalar state not yet implemented.')

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

const Struct = class Struct extends Structural {} as StructConstructor

//// Presets ////

/**
 * State preset for a generic objects.
 * Any property is considered state, so long as it isn't an object prototype property.
 */
type PublicState<T extends Struct> = Pick<T, Exclude<KeysOf<T>, 'toString' | 'valueOf'>>

/**
 * In a public struct any property is considered state, so long as it isn't an object 
 * prototype property.
 */
abstract class PublicStruct extends Struct {
    get [$$state](): PublicState<this> {
        return omit(this, 'toString', 'valueOf') as PublicState<this>
    }
}

/**
 * State preset for generic data objects.
 * Any property that isn't a method is considered state.
 */
type DataState<T extends Struct> = {
    [K in KeysOf<T> as T[K] extends Func ? never : K]: T[K]
}

abstract class DataStruct extends Struct {

    get [$$state](): DataState<this> {

        const state = {} as DataState<this>

        for (const key of keysOf(this)) {
            if (!isFunc(this[key]))
                (state as any)[key] = this[key]
        }

        return state
    }

}

//// Exports ////

export default Struct

export {

    Struct,
    StructState,
    StructStateApply,
    StructDeepStateApply,
    StructDeepPaths,

    StatefulStruct,
    State,
    $$state,

    PublicState,
    PublicStruct,

    DataState,
    DataStruct,

    getDeepState as getState,
    getShallowState,
    setState,
    applyState,
    copyWithoutState,
    showStateKeys,
    hideNonStateKeys,
    matchKeyVisibility
}