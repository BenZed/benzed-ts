import { Component } from '../component'
import { Transfer, TransferContext } from './node'

import { resolveIndex, shuffle } from '@benzed/array'

/*** Eslint ***/

/* eslint-disable @typescript-eslint/no-explicit-any */

/*** SwitchTransfer ***/
export default function transfer <I,O,T extends Component<O, any>>(
    func:Transfer<I,O,T>
): Transfer<I,O,T> {
    return func
}

export { transfer }

interface SwitchTransferOptions {
    readonly random: boolean
}
export interface SwitchTransfer extends Transfer {}
transfer.switcher = (options?: SwitchTransferOptions): SwitchTransfer => {

    const targets: Component[] = []

    return ctx => {

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

/*** LinearTransfer ***/

interface LinearTransferOptions {
    readonly index: number
}
export interface LinearTransfer extends Transfer {}
transfer.linear = (options?: LinearTransferOptions): LinearTransfer => 
    ctx => ctx.targets[resolveIndex(ctx.targets, options?.index ?? 0)] ?? null