import { merge } from './merge'

import { IO } from './structures'

import { asVoid, isVoid, voided } from './void'

//// Types ////

type AsValue<T> = Exclude<T, null | undefined | void>

interface UseValue<T = unknown> {
    <F extends IO<T>>(f: F, defaultValue: T | void): Optional<ReturnType<F>>
}

interface Void { 
    hasValue: false
}

interface Value<T = unknown> extends Iterable<T> {
    hasValue: true
    value: T
}

type Optional<T = unknown> = Value<T> | Void

type UseOptional<T = unknown> = UseValue<T> & (Void | Value<T>)

//// Helper ////

function useValue(this: Optional, io: IO, defaultValue: unknown | void): UseOptional {

    if (this.hasValue)
        return optional(io(this.value))

    const def = optional(defaultValue)
    if (def.hasValue)
        return optional(io(def.value))

    return optional(voided as unknown)
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

    const value = isOptional(input) ? input.hasValue ? input.value : voided : input

    const state = isVoid(asVoid(value))
        ? { hasValue: false } as Void
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

    Void,
    Value
}