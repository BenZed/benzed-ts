import type { MatchState } from './match-state'
import type { Match, OutputArray } from './types'

import {
    matchAnyInput,
    passThrough,

    matchCheck,
} from './util'

import { isNumber } from '@benzed/is'

/* eslint-disable @typescript-eslint/no-explicit-any */

/*** Helper ***/

function signatureToOptions<I, O>(
    args: unknown[],
    config: {
        [numArgs: number]: {
            input?: number
            output?: number
            finalize?: boolean
        }
    }
): { input: I, output: O } {

    const option = config[args.length]
    if (!option) {
        throw new Error(
            'Invalid signature, requires ' +
            `${Object.keys(config).join(' or ')} parameters.`
        )
    }

    const { input, output, finalize } = option

    return {
        input: isNumber(input) ? args[input] : matchAnyInput,
        output: isNumber(output) ? args[output] : passThrough,
        finalize
    } as any
}

const SIGNATURE_OK = {}

/*** Main ***/

function createMatch<I, O extends OutputArray, OT>(
    state: MatchState<I, O>
): Match<I, O, OT> {

    // Match Dynamic Signature

    const match: Match<I, any> = ((...args: unknown[]) =>
        state.addMatchCase(
            signatureToOptions<I, any>(args, {
                1: { output: 0, finalize: true },
                2: { input: 0, output: 1 }
            }),
        ) ?? match

    ) as Match<I, any>

    // Match Interface

    match.default = ((...args: unknown[]) =>
        state.addMatchCase({
            ...signatureToOptions(args, {
                0: SIGNATURE_OK,
                1: { output: 0 }
            }),
            finalize: true
        }) ?? match) as unknown as Match<I, any>['default']

    match.break = (...args: unknown[]) =>
        state.addMatchCase(
            signatureToOptions(args, {
                1: { input: 0 },
                2: { input: 0, output: 1 }
            })
        ) ?? match

    match.fall = (...args: unknown[]) =>
        state.addMatchCase({
            ...signatureToOptions(args, {
                1: { output: 0 },
                2: { input: 0, output: 1 }
            }),
            operation: 'fall'
        }) ?? match

    match.discard = (...args: unknown[]) =>
        state.addMatchCase({
            ...signatureToOptions(args, {
                0: SIGNATURE_OK,
                1: { input: 0 }
            }),
            operation: 'discard'
        }) ?? match as ReturnType<Match<I, any>['discard']>

    match.keep = ((...args) => {

        const { input } = signatureToOptions(args, { 1: { input: 0 } })

        const invertDiscard = (value: unknown): boolean => !matchCheck(input, value)

        return match.discard(invertDiscard)

    }) as Match<I, O>['keep']

    match.finalize = (() => {
        state.assertOutputCases()
        state.finalized = true
        return match
    }) as unknown as Match<I, O>['finalize']

    // Match Finalized Interface

    match.next = () => {
        const [output] = state
        return output
    }

    match.rest = () => {
        const [...output] = state
        return output
    }

    match[Symbol.iterator] = state[Symbol.iterator]

    return match as Match<I, O, OT>
}

/*** Exports ***/

export default createMatch

export {
    createMatch
}