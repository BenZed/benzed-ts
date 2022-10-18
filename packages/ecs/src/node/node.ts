import { Component, Execute, InputOf, OutputOf } from '../component'

import { TransferMethod, TransferNode } from './transfer-node'

/*** Eslint ***/

/* 
    eslint-disable 
        @typescript-eslint/no-explicit-any,
        @typescript-eslint/explicit-function-return-type 
*/

function createNode<E extends Execute<any>>(
    this: { createTransfer: () => TransferMethod<InputOf<E>, OutputOf<E>> },
    execute: E,
    transfer?: TransferMethod<InputOf<E>, OutputOf<E>>
): Node<Component<InputOf<E>, OutputOf<E>>>

function createNode<C extends Component<any>>(
    this: { createTransfer: () => TransferMethod<InputOf<C>, OutputOf<C>> },
    component: C,
    transfer?: TransferMethod<InputOf<C>, OutputOf<C>>
): Node<C> 

function createNode(
    this: { createTransfer: () => TransferMethod<unknown> },
    input: Execute<unknown> | Component<unknown>,
    transfer: TransferMethod<unknown> = this.createTransfer()
): Node<Component<unknown>> {
    return new class extends Node<Component<unknown>> {
        protected _transfer = transfer
    }(
        typeof input === 'function'
            ? { execute: input }
            : input
    )
}

/*** Node ***/

/**
 * The "standard" node class that would be extended for simple cases.
 * Simply wraps a component and transfer method.
 */
export abstract class Node<C extends Component<any,any> = Component> 
    extends TransferNode<InputOf<C>, OutputOf<C>> {

    public static createTransfer(): TransferMethod<unknown> {
        return ctx => ctx.targets[0] ?? null
    }

    public static create = createNode

    public constructor(
        component: C,
    ) {
        super()
        this._execute = component.execute.bind(component)
    }

    protected readonly _execute: C['execute']

}

