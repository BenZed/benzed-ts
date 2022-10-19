import { Component } from '../component'
import { Node } from './node'
import { TransferMethod } from './transfer-node'

import { shuffle } from '@benzed/array'

/*** Eslint ***/

/* eslint-disable @typescript-eslint/no-explicit-any */

/*** Options ***/

export interface SwitchNodeOptions {

    /**
     * Randomize transfer target rather
     * than iterating through them linearally.
     * False by default.
     */
    readonly random: boolean

}

/*** Node ***/

/**
 * A switch node alternates its transfer target on every execution.
 */
export class SwitchNode<C extends Component<any,any> = Component> 
    extends Node<C> {

    public static createTransfer<O>(
        options: SwitchNodeOptions = { random: false }
    ): TransferMethod<Component<O, unknown>> {

        const targets: Component<O, unknown>[] = []

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

    public constructor(
        component: C,
        options?: SwitchNodeOptions
    ) {
        super(component)
        this._transfer = SwitchNode.createTransfer(options)
    }

    protected readonly _transfer

}