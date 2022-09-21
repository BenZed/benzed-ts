import type { MatchState } from './match-state'
import type { MatchInProgress, MatchOutput, OutputArray } from './types'

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

function matchCreateInstance<I, O extends OutputArray, OT>(
    state: MatchState<I, MatchOutput<OT, O>>
): MatchInProgress<I, O, OT> {

    // Match Dynamic Signature

    const match: MatchInProgress<I, any> = ((...args: unknown[]) =>
        state.addCase(
            signatureToOptions<I, any>(args, {
                1: { output: 0, finalize: true },
                2: { input: 0, output: 1 }
            }),
        ) ?? match

    ) as MatchInProgress<I, any>

    // Match Interface

    match.default = ((...args: unknown[]) =>
        state.addCase({
            ...signatureToOptions(args, {
                0: SIGNATURE_OK,
                1: { output: 0 }
            }),
            finalize: true
        }) ?? match) as unknown as MatchInProgress<I, any>['default']

    match.break = (...args: unknown[]) =>
        state.addCase(
            signatureToOptions(args, {
                1: { input: 0 },
                2: { input: 0, output: 1 }
            })
        ) ?? match

    match.fall = (...args: unknown[]) =>
        state.addCase({
            ...signatureToOptions(args, {
                1: { output: 0 },
                2: { input: 0, output: 1 }
            }),
            operation: 'fall'
        }) ?? match

    match.discard = (...args: unknown[]) =>
        state.addCase({
            ...signatureToOptions(args, {
                0: SIGNATURE_OK,
                1: { input: 0 }
            }),
            operation: 'discard'
        }) ?? match as ReturnType<MatchInProgress<I, any>['discard']>

    match.keep = ((...args) => {

        const { input } = signatureToOptions(args, { 1: { input: 0 } })

        const invertDiscard = (value: unknown): boolean => !matchCheck(input, value)

        return match.discard(invertDiscard)

    }) as MatchInProgress<I, O>['keep']

    match.finalize = (() => {
        state.assertOutputCases()
        state.finalize()
        return match
    }) as unknown as MatchInProgress<I, O>['finalize']

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

    return match as MatchInProgress<I, O, OT>
}

/*** Exports ***/

export default matchCreateInstance

export {
    matchCreateInstance
}