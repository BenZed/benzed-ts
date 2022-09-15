import type MatchState from './match-state'
import type { Match, Outputs } from './types'

import {
    invertMatchCheck,
    matchAnyInput,
    matchIterateOutput,

    $$discard,
    $$fall
} from './util'

import { isSymbol } from '@benzed/is'

/*** Main ***/

function createMatch<I, O extends Outputs>(
    state: MatchState<I, O>
): Match<I, O> {

    // Match Shortcut Main Interface
    const match: Match<I, O> = ((...args: unknown[]) => {

        // check for final cases
        if (state.finalized)
            throw new Error('No more cases may be defined.')

        // get symbolic modifier
        const $$symbol = isSymbol(args.at(-1))
            ? args.pop() as symbol
            : null

        // sort arguments
        let [input, output] = args as unknown as [I, O[number]]
        const isPipeArg = args.length === 1 && $$symbol !== $$discard
        if (isPipeArg) {
            output = input as unknown as O
            input = matchAnyInput as unknown as I
        }

        // handle cases
        state.cases.push({ input, output, $$symbol })
        state.finalized = isPipeArg && !$$symbol

        // return interface
        return match
    }) as unknown as Match<I, O>

    // Match Methods Interface

    match.default = input => match(input)

    match.break = (input, output) => match(input, output)

    match.fall = ((...args: unknown[]) =>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (match as any)(...args, $$fall)
    ) as Match<I, O>['fall']

    match.discard = input => match(input, $$discard) as ReturnType<Match<I, O>['discard']>

    match.keep = input => {
        const invertDiscard = (value: unknown): boolean => invertMatchCheck(input, value)
        return match.discard(invertDiscard)
    }

    match.finalize = (() => {
        state.assertOutputCases()
        state.finalized = true
        return match
    }) as unknown as Match<I, O>['finalize']

    // Match Finalized Interface

    match.next = () => {
        const [output] = match
        return output
    }

    match.rest = () => {
        const [...output] = match
        return output
    }

    match[Symbol.iterator] = (
        () => matchIterateOutput(state)
    ) as unknown as Match<I, O>[typeof Symbol.iterator]

    return match
}

/*** Exports ***/

export default createMatch

export {
    createMatch
}