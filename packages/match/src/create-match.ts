import type MatchState from './match-state'
import type { Match, Outputs } from './types'

import {
    invertMatchCheck,
    matchAnyInput,
    matchIterateOutput,

    $$discard,
    $$fall
} from './util'

/*** Main ***/

function createMatch<I, O extends Outputs>(
    state: MatchState<I, O>
): Match<I, O> {

    // Match Shortcut Main Interface
    const match = (...args: unknown[]): unknown => {

        // check for final cases
        if (state.finalized)
            throw new Error('No more cases may be defined.')

        const $$ymbol = typeof args.at(-1) === 'symbol'
            ? args.pop() as symbol
            : null

        // sort arguments
        let [input, output] = args as [I, O]
        const isPipeArg = args.length === 1 && $$ymbol !== $$discard
        if (isPipeArg) {
            output = input as unknown as O
            input = matchAnyInput as unknown as I
        }

        // handle cases
        state.cases.push({ input, output, $$ymbol })
        state.finalized = isPipeArg && !$$ymbol

        // return interface
        return match
    }

    // Match Methods Interface

    match.default = (input: unknown) => match(input)

    match.break = (input: unknown, output: unknown) => match(input, output)

    match.fall = (...args: unknown[]) => match(...args, $$fall)

    match.discard = (input: unknown) => match(input, $$discard)

    match.keep = (input: unknown) => {
        const invertDiscard = (value: unknown): boolean => invertMatchCheck(input, value)
        return match.discard(invertDiscard)
    }

    match.finalize = () => {
        state.assertOutputCases()
        state.finalized = true
        return match
    }

    // Match Finalized Interface

    match.next = () => {
        const [output] = match as unknown as Iterable<O>
        return output
    }

    match.remaining = () => {
        const [...output] = match as unknown as Iterable<O>
        return output
    }

    (match as unknown as Iterable<unknown>)[Symbol.iterator] = () =>
        matchIterateOutput(state)

    return match as unknown as Match<I, O>
}

/*** Exports ***/

export default createMatch

export {
    createMatch
}