import { asNil, isNil, nil } from './nil'

import { merge } from './merge'

import { Map } from './types'

//// Types ////

type AsValue<T> = Exclude<T, null | undefined | void>

interface UseValue<T = unknown> {
    <F extends Map<T>>(f: F, defaultValue?: T): Optional<ReturnType<F>>
}

interface None { 
    hasValue: false
}

interface Value<T = unknown> extends Iterable<T> {
    hasValue: true
    value: T
}

type Optional<T = unknown> = Value<T> | None

type UseOptional<T = unknown> = UseValue<T> & (None | Value<T>)

//// Helper ////

function useValue(this: Optional, map: Map, defaultValue?: unknown): UseOptional {

    if (this.hasValue)
        return optional(map(this.value))

    const def = optional(defaultValue)
    if (def.hasValue)
        return optional(map(def.value))

    return optional(nil as unknown)
}

function* get<T>(this: Value<T>): Generator<T> {
    yield this.value
}

//// Main ////

function isOptional<T = unknown>(input: unknown): input is Optional<T> {
    return (

        typeof input === 'function' || typeof input === 'object' && 

        input !== null

    ) && typeof (
        input as { hasValue: boolean | void }
    ).hasValue === 'boolean'
}

function optional<T>(input: T | Optional<T>): UseOptional<AsValue<T>> {

    const value = isOptional(input) ? input.hasValue ? input.value : nil : input

    const state = isNil(asNil(value))
        ? { hasValue: false } as None
        : { hasValue: true, [Symbol.iterator]: get, value }

    return merge(useValue.bind(state), state) as UseOptional<AsValue<T>>
}

//// Extend ////

optional.is = isOptional

//// Exports ////

export default optional 

export {

    optional,
    isOptional,

    Optional,
    UseOptional,

    None,
    Value
}