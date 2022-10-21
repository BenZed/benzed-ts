import { Component, isComponent } from '../component'

/*** Eslint ***/

/* eslint-disable 
    @typescript-eslint/no-explicit-any, 
    @typescript-eslint/explicit-function-return-type 
*/

/*** Types ***/

export type TargetOf<N> = 
 N extends _Node<any, any, infer T> 
     ? T
     : unknown

/**
 * Method used to compute the next target
 */
export interface Transfer<
    I = unknown,
    O = I,
    T extends Component<O, any> = Component<O, unknown>
> {
    (ctx: TransferContext<I, O, T>): T | null
}

/**
* Context passed to a transfer method
*/
export interface TransferContext<
    I = unknown,
    O = I,
    T extends Component<O, any> = Component<O, unknown>
> {
    input: I
    output: O
    targets: T[]
}

/*** Node ***/

/**
 * Abstract node that would be extended for most advanced cases
 */
export abstract class _Node<
    I = unknown,
    O = unknown,
    T extends Component<O, any> = Component<O, unknown>
> extends Component<I, O> {

    /**
     * With the context of a completed execution, retrieve the target that this node is 
     * transferring it's output to.
     */
    abstract transfer(ctx: TransferContext<I,O,T>): T | null

}

export function isNode<T>(input: unknown): input is _Node<T> {
    if (!isComponent(input))
        return false 

    const node = input as Partial<_Node<T>>
    return typeof node.transfer === 'function'
}