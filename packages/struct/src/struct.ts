import { 
    assign, 
    Func, 
    nil, 
    provideCallableContext, 
    Callable, 
    isFunc, 
    Property,
    keysOf,
    symbolsOf,
    isObject
} from '@benzed/util'

import {
    State, 
    $$state, 
    StructState,
    StructStateApply, 
    StructStatePaths,
    StructStatePathApply 
} from './state'

//// EsLint ////
/* eslint-disable 
    @typescript-eslint/no-explicit-any,
    @typescript-eslint/ban-types
*/

interface StructConstructor {
    new (): State
    new <F extends Func>(signature: F): State & F
}

//// Helper ////

function getNamesAndSymbols(object: object): Set<symbol | string> {
    return new Set([
        ...keysOf(object),
        ...symbolsOf(object)
    ])
}

function applySignature<T extends State>(struct: T, signature?: Func): T {
    return signature

        ? Callable.create(
            signature,
            struct,
            provideCallableContext
        ) as T

        : struct
}

function getStateDescriptor<T extends State>(struct: T): PropertyDescriptor | nil {
    return Property.descriptorOf(struct, $$state)
}

function setKeyEnumerable<T extends State>(struct: T, enumerable: boolean, stateKeys: (keyof T)[]): void {

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

function getState<T extends State>(struct: T, deep: boolean): StructState<T> {

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

function stateEquals(a: unknown, b: unknown): boolean {
    if (Object.is(a, b)) 
        return true 

    if (!isObject(a) || !isObject(b))
        return false

    const namesAndSymbols = getNamesAndSymbols(a)
    if (namesAndSymbols.size !== getNamesAndSymbols(b).size)
        return false 

    for (const nameOrSymbol of namesAndSymbols) {
        if (!stateEquals(
            a[nameOrSymbol as keyof typeof a],
            b[nameOrSymbol as keyof typeof b]
        ))
            return false
    }

    return true
}

function getShallowState<T extends State>(struct: T): StructState<T> {
    return getState(struct, false)
}

//// Utility ////

function matchKeyVisibility<T extends State>(source: T, target: T): void {

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
function showStateKeys<T extends State>(struct: T, ...keys: (keyof StructState<T>)[]): void {
    setKeyEnumerable(struct, true, keys as (keyof T)[])
}

/**
 * Turn off enumerability of the provided struct keys.
 */
function hideNonStateKeys<T extends State>(struct: T, ...keys: (string | symbol)[]): void {
    setKeyEnumerable(struct, false, keys as (keyof T)[])
}

/**
 * Retreive the deep state of a struct.
 */
function getDeepState<T extends State>(struct: T): StructState<T> {
    return getState(struct, true)
}

/**
 * Over-write the state of a struct without creating a copy of it.
 */
function setState<T extends State>(struct: T, state: StructState<T>): void {

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
function applyState<T extends State>(struct: T, state: StructStateApply<T>): T 
function applyState<T extends State, P extends StructStatePaths<T>>(
    struct: T, 
    ...deepState: StructStatePathApply<T, P>
): T 
function applyState(struct: State, ...args: unknown[]): State {

    const previousState = getShallowState(struct)
    const newStruct = copyWithoutState(struct)
    // first apply old state, in case of nested structs
    setState(newStruct, previousState)

    // Nest state if it is being deeply set
    let state = args.pop()
    const deepKeys = args.reverse() as (keyof State)[]
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
function copyWithoutState<T extends State>(struct: T): T {
    
    const newStruct = Object.create(struct.constructor.prototype)

    const signature = isFunc(struct)
        ? Callable.signatureOf(struct)
        : nil 

    return applySignature(newStruct, signature)
}

/**
 * Create an immutable copy of a struct
 */
function copy<T extends State>(struct: T): T {
    return applyState(struct, getShallowState(struct))
}

/**
 * Do two structs have the same constructor and state?
 */
function equals<T extends State>(a: T, b: State): b is T {
    return (
        b.constructor === a.constructor &&
        stateEquals(
            getDeepState(a),
            getDeepState(b)
        )
    )
}

//// Implementation ////

const Struct = class Struct {

    static [Symbol.hasInstance] = Callable[Symbol.hasInstance]

    constructor(signature?: Func) {
        return applySignature(this as any, signature)
    }

} as StructConstructor

//// Exports ////

export default Struct

export {

    Struct,

    getNamesAndSymbols,
    getDeepState as getState,
    getShallowState,
    setState,
    applyState,

    equals,

    copy,
    copyWithoutState,

    showStateKeys,
    hideNonStateKeys,
    matchKeyVisibility,

}