import { Component, Execute } from './component'

import { shuffle } from '@benzed/array'

/*** Eslint ***/

/* eslint-disable @typescript-eslint/no-explicit-any */

/*** Node Transfer ***/

export type TransferInput<
    I,
    O,
    T extends Component<O, any> = Component<O,unknown>
> = { readonly targets: readonly T[], readonly input: I, readonly output: O }

export type Transfer<
    I,
    O,
    T extends Component<O> = Component<O,unknown>
> = 
    Execute<
    /**/ TransferInput<I, O ,T>, 
    /**/ T | null
    >

export type TargetOf<T> = T extends Transfer<any,infer T1> | Node<any, any, infer T1> 
    ? T1
    : unknown

/*** Node ***/

export abstract class Node<
    I = unknown,
    O = unknown,
    T extends Component<O,any> = Component<O,unknown>
> extends Component<I,O> {

    public abstract transfer(ctx: TransferInput<I, O, T>): T | null

}

/*** Transfer Node ***/

/**
 * A transfer node is a node where the transfer logic is decoupled 
 * from the node logic. A transfer node should be able to
 * house any type of component.
 */
export abstract class TransferNode<I,O> extends Node<I,O> {

    public constructor(
        public readonly transfer: Transfer<I,O>
    ) {
        super()
    }

}

/*** Switch Transfer Node ***/

export abstract class SwitchNode<I,O> extends TransferNode<I,O> {

    /**
     * Create the transfer function used in a switch node for use in other
     * components
     */
    public static createTransfer(random: boolean): Transfer<unknown,unknown> {

        const targets: Component[] = []

        return ctx => {

            const refresh = targets.length === 0
            if (refresh) {
                targets.push(...ctx.targets)
                targets.reverse()
            }
    
            if (refresh && random)
                shuffle(targets)

            return targets.pop() ?? null
        }

    }

    public constructor(
        random: boolean
    ) {
        super(SwitchNode.createTransfer(random))
    }

}