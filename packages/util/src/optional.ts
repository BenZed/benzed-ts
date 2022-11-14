import { merge } from './merge'
import { asVoid, isVoid, voided } from './void'

//// Types ////

type Real<T> = Exclude<T, null | undefined | void>

type WithValue<T = unknown> = (input: T) => unknown

interface Use<T = unknown> {

    <F extends WithValue<T>>(f: F, defaultValue: T | void): Optional<ReturnType<F>>

}

interface None { 
    hasValue: false 
}

interface Value<T = unknown> extends Iterable<T> {
    hasValue: true
    value: T
}

type Optional<T = unknown> = Value<T> | None

type UseOptional<T = unknown> = Use<T> & (None | Value<T>)

//// Helper ////

function use(this: Optional, f: WithValue, defaultValue: unknown | void): UseOptional {

    if (this.hasValue)
        return optional(f(this.value))

    const def = optional(defaultValue)
    if (def.hasValue)
        return optional(f(def.value))

    return optional(voided as unknown)
}

function* get<T>(this: Value<T>): Generator<T> {
    yield this.value
}

//// Main ////

function isOptional<T = unknown>(input: unknown): input is Optional<T> {
    return (typeof input === 'function' || typeof input === 'object' && input !== null) && 
        typeof (input as { hasValue: boolean | void }) === 'boolean'
}

function optional<T>(input: T | Optional<T>): UseOptional<Real<T>> {

    const value = isOptional(input) ? input.hasValue ? input.value : voided : input

    const state = isVoid(asVoid(value))
        ? { hasValue: false } as None
        : { hasValue: true, [Symbol.iterator]: get, value }

    return merge(use.bind(state), state) as UseOptional<Real<T>>
}

//// Extend ////

optional.is = isOptional

//// Exports ////

export default optional 

export {
    optional,
    isOptional,
    Optional,
    None,
    Value
}