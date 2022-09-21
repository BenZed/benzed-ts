import type { MatchInProgress, Match, MatchOutput } from './types'

import MatchIterableState, { MatchState } from './match-state'

import matchCreateInstance from './match-create-instance'
import { matchAnyInput, matchCheck } from './util'

/* eslint-disable @typescript-eslint/indent */

/*** Main Interface Method ***/

function match<A extends readonly unknown[]>(...values: A): MatchInProgress<A[number], []>
function match<A extends readonly unknown[], O>(...values: A): MatchInProgress<A[number], [], O>
function match<O>(...values: unknown[]): MatchInProgress<unknown, [], O>
function match(...values: unknown[]): unknown {

    const iterable: Iterable<unknown> = values

    return matchCreateInstance(
        new MatchIterableState(iterable)
    )
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
* Wait until a specified number of matches before matching this input
*/
match.after = <I = typeof matchAnyInput>(iterations: number, input?: I): I =>

    ((value: unknown): boolean => {

        const isMatch = matchCheck(input ?? matchAnyInput, value)
        if (isMatch && iterations > 0)
            iterations--

        if (!isMatch || iterations > 0)
            return false

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
match.each = <I, OT = void>(iterable: Iterable<I>): MatchInProgress<I, [], OT> =>
    matchCreateInstance(
        new MatchIterableState<I, MatchOutput<OT, []>>(iterable)
    )

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

/**
 * Creates a reusable match expression that is
 * given values after the fact
 */
match.for = <I, O>(
    defineCases: (m: MatchInProgress<I, [], O>) => Match<O>
): ((value: I) => O) => {

    const state = new MatchState<I, never>()

    defineCases(
        matchCreateInstance(state)
    )

    state.assertOutputCases()

    return value => {
        const success = state.match(value)
        if (!success)
            throw new Error('Value was discarded.')

        return success.output
    }

}

/*** Exports ***/

export default match

export {
    match,
    MatchInProgress,
    Match
}