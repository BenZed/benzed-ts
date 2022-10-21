import { Component } from '../component'
import { Transfer } from './node'

import { shuffle } from '@benzed/array'

/*** Eslint ***/

/* eslint-disable @typescript-eslint/no-explicit-any */

/*** SwitchTransfer ***/

/**
 * Switch Transfer Options
 */
interface SwitchTransferOptions {
    
    /**
     * Nodes will be switched to at random, rather than in a linear order
     */
    readonly random: boolean
}

/**
 * Switch Transfer
 * 
 * Switch transfer switches the target from each invocation in a linear fashion
 * until
 */
export interface SwitchTransfer<O> extends Transfer<any, O> {}
export const switcher = <O>(options?: SwitchTransferOptions): SwitchTransfer<O> => {

    const targets: Component[] = []

    return (ctx => {

        const refresh = targets.length === 0
        if (refresh) {
            targets.push(...ctx.targets)
            targets.reverse()
        }

        if (refresh && options?.random)
            shuffle(targets)

        return targets.pop() ?? null

    }) as SwitchTransfer<O>
}

