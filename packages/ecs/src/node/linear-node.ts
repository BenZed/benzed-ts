import { Component } from '../component'
import { Node } from './node'
import { TransferMethod } from './transfer-node'

/*** Eslint ***/

/* eslint-disable @typescript-eslint/no-explicit-any */

/*** Options ***/

interface LinearNodeOptions {

    /**
     * Resolve a target at a specified index. 
     * 0 by default.
     */
    readonly index: number

}

/*** Linear Node ***/

/**
 * A linear node resolves a target at the same index every time.
 */
export class LinearNode<C extends Component<any,any> = Component> extends Node<C> {

    public static createTransfer<O>(options: LinearNodeOptions): TransferMethod<unknown, O> {
        return ctx => ctx.targets.at(options.index) ?? null
    }

    public constructor(
        component: C | C['execute'],
        public readonly options: LinearNodeOptions = { index: 0 }
    ) {
        super(
            component,
            LinearNode.createTransfer(options)
        )
    }

}