import type { Match, MatchFinalized } from './types'

import MatchState from './match-state'

import createMatch from './create-match'
import { $$iterable, matchAnyInput, matchCheck } from './util'

/* 
    eslint-disable 
    @typescript-eslint/indent,
*/

/*** Main Interface Method ***/

function match<A extends readonly unknown[]>(...values: A): Match<A[number], []> {

    type T = A[number]

    const iterable = (
        values[1] === $$iterable
            ? values[0]
            : values
    ) as Iterable<never>

    const state = new MatchState<T, []>(iterable)

    return createMatch<T, []>(state)

}

/*** Extensions ***/

/**
 * Match the provided input an arbitrary number of times
 */
match.n = <I = typeof matchAnyInput>(times: number, input?: I): I =>

    ((value: unknown): boolean => {

        const isMatch = matchCheck(input ?? matchAnyInput, value)
        if (!isMatch || times <= 0)
            return false

        times--

        return true
    }) as unknown as I

/**
* Match the provided input only once
*/
match.once = <I = typeof matchAnyInput>(input?: I): I =>
    match.n(1, input ?? matchAnyInput) as I

/**
* Match each item in a provided iterator
*/
match.each = <I>(iterable: Iterable<I>): Match<I, []> =>
    match(iterable, $$iterable)

/**
* Match each of the provided values
*/
match.values = <A extends readonly unknown[]>(...args: A) =>
    match(...args)

/**
* Match a template string
*/
match.template = <A extends readonly unknown[]>(
    strings: TemplateStringsArray,
    ...values: A
) => {

    type Zipped<T extends readonly unknown[]> =
        T extends [infer TI, ...infer TR]
        ? TR extends []
        ? [[string, TI]]
        : [[string, TI], ...Zipped<TR>]
        : [string, T[number]][]

    const zipped = strings
        .map((str, i) => [str, values[i]]) as Zipped<A>

    return match(...zipped)
}

/*** Exports ***/

export default match

export {
    match,
    Match,
    MatchFinalized
}