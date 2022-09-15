import type { MatchState } from './match-state'
import type { Outputs } from './types'

import { isFunction } from '@benzed/is'

/*** Symbols ***/

export const $$iterable = Symbol('this-value-is-an-iterable')

export const $$fall = Symbol('pipe-output-to-remaining-cases')

export const $$discard = Symbol('disallow-output-from-this-input')

/*** Functions ***/

export function resolveOutput<I, O>(
    output: O,
    input: I,
    _default = output
): O {

    return isFunction(output)
        ? output(input)
        : _default
}

export function matchAnyInput(): true {
    return true
}

export function matchCheck(input: unknown, value: unknown): boolean {
    return !!resolveOutput(input, value, input === value)
}

export function invertMatchCheck(input: unknown, value: unknown): boolean {
    return !matchCheck(input, value)
}

export function* matchIterateOutput<I, O extends Outputs>(
    state: MatchState<I, O>
): Generator<O[number]> {

    state.assertOutputCases()

    let result = state.iterator.next()
    if (result.done) {
        throw new Error(
            state.valueYieldedAtLeastOnce
                ? 'All values matched.'
                : 'No values to match.'
        )
    }

    // get values
    while (!result.done) {

        let { value } = result
        let valueYielded = false
        let valueDiscarded = false

        // check value against all cases
        for (const { input, output, $$symbol } of state.cases) {

            const discard = $$symbol === $$discard
            const fall = $$symbol === $$fall

            const isMatch = matchCheck(input, value)
            if (isMatch && !discard)
                value = resolveOutput(output, value)

            if (isMatch && discard)
                valueDiscarded = true

            // send output
            if (isMatch && !discard && !fall) {
                valueYielded = true
                state.valueYieldedAtLeastOnce = true
                yield value as unknown as I
            }

            if (isMatch && !fall)
                break
        }

        // unless discarded, every value needs a match
        if (!valueYielded && !valueDiscarded)
            throw new Error(`No match for value: ${value}.`)

        result = state.iterator.next()
    }

    // discard check
    if (!state.valueYieldedAtLeastOnce)
        throw new Error('All values discarded.')

}
