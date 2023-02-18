import { define } from '../methods'
import { Func } from './func'
import { assign } from './merge'
import { nil } from './nil'

//// Symbol ////

const $$error = Symbol('optional-error-message')

//// Types ////

interface Match<T> {
    <F extends Matcher<T>>(
        withValue: F
    ): Optional<ReolveMatcherOutput<T, F>>
}

type Matcher<T> = (value: T) => unknown

type ReolveMatcherOutput<T, F extends Matcher<T>> = 
     nil extends ReturnType<F> ? T : ReturnType<F> 

interface Assert<T> {
    assert(error?: string): T
}

interface Nil {
    readonly has: false
    readonly value?: nil
}

interface Value<T> {
    readonly has: true 
    readonly value: T 
}

type Optional<T> = (Nil | Value<T>) & Match<T> & Assert<T>

type ToOptional<T> = Exclude<T, nil>

type Has<T> = Exclude<Optional<T>, Nil>

//// Helper ////

function assert<T>(this: Optional<ToOptional<T>> & { [$$error]?: string }, error = this[$$error] ?? 'Does not have value'): T {
    if (!this.has)
        throw new Error(error)

    return this.value
}

//// Main ////

function optional<T>(value?: T, error?: string): Optional<ToOptional<T>> {
    const has = value !== nil

    const state = has ? { has, value } : { has }

    const match = (action: Func): unknown => 
        output.has 
            ? optional(action(output.value), (output as { [$$error]?: string })[$$error]) 
            : output

    define(match, 'assert', { value: assert, writable: true, configurable: true })
    if (error)
        define(match, $$error, { value: error, writable: true, configurable: true })

    const output = assign(match, state) 
    return output as Optional<ToOptional<T>>

}

optional.nil = <T>(error?: string) => optional<T>(nil, error)
optional.value = <T>(value: ToOptional<T>, error?: string) => optional<T>(value, error)

//// Exports ////

export {
    optional,
    Optional,
    ToOptional,
    Value,
    Nil,
    Has
}