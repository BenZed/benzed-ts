import { through } from '../methods/returns'
import { merge } from './merge'
import { nil } from './nil'
import { Mutable } from './types'

//// Types ////

interface Match<T> {
    <F extends (input: T) => unknown>(doWith: F): ReturnType<F> | nil
    (): T | nil
}

interface Nil {
    readonly has: false 
}

interface Value<T> {
    readonly has: true 
    readonly value: T 
}

type Optional<T> = (Nil | Value<T>) & Match<T>

//// Main ////

function optional<T>(...args: [value: T] | []): Optional<T> {
    const has = args.length > 0

    const optional = merge((f = through, d?: unknown) => 
        optional.has 
            ? f(optional.value) 
            : d
    , { has }) as Optional<T>

    if (has)
        (optional as Mutable<Value<T>>).value = args[0] as T

    return optional

}

optional.nil = <T>() => optional<T>()
optional.value = <T>(value: T) => optional<T>(value)

//// Exports ////

export {
    optional,
    Optional,
    Value,
    Nil
}