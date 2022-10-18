import { Component, InputOf, OutputOf } from '../component'

import { TransferMethod, TransferNode } from './transfer-node'

/*** Eslint ***/

/* eslint-disable @typescript-eslint/no-explicit-any */

/*** Node ***/

/**
 * The "standard" node class that would be extended for simple cases.
 * Simply wraps a component and transfer method.
 */
export class Node<C extends Component<any,any> = Component> 
    extends TransferNode<InputOf<C>, OutputOf<C>> {

    public constructor(
        execute: C | C['execute'],
        protected readonly _transfer: TransferMethod<InputOf<C>, OutputOf<C>>
    ) {
        super()
        this._execute = typeof execute === 'function'
            ? execute
            : execute.execute.bind(execute)
    }

    protected readonly _execute: C['execute']

}
