import { Component } from '../component'
import { Transfer } from './node'

import { shuffle } from '@benzed/array'

/*** Eslint ***/

/* eslint-disable @typescript-eslint/no-explicit-any */

/*** SwitchTransfer ***/

interface SwitchTransferOptions {
    readonly random: boolean
}
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

