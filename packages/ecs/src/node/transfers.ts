import { Component } from '../component'
import { Transfer, TransferContext } from './_node'

import { resolveIndex, shuffle } from '@benzed/array'

/*** Eslint ***/

/* eslint-disable @typescript-eslint/no-explicit-any */

/*** SwitchTransfer ***/

interface SwitchTransferOptions {
    readonly random: boolean
}
export interface SwitchTransfer extends Transfer<any> {}
export const switcher = (options?: SwitchTransferOptions): SwitchTransfer => {

    const targets: Component[] = []

    return (ctx: TransferContext) => {

        const refresh = targets.length === 0
        if (refresh) {
            targets.push(...ctx.targets)
            targets.reverse()
        }

        if (refresh && options?.random)
            shuffle(targets)

        return targets.pop() ?? null

    }
}

/*** LinearTarget ***/

interface LinearTransferOptions {
    readonly index: number
}
export interface LinearTransfer extends Transfer<any> {}
export const linear = (options?: LinearTransferOptions): LinearTransfer => 
    (ctx: TransferContext) => ctx.targets[resolveIndex(ctx.targets, options?.index ?? 0)] ?? null