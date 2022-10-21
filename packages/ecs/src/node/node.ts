import { Component, isComponent } from '../component'

/*** Eslint ***/

/* eslint-disable 
    @typescript-eslint/no-explicit-any
*/

/*** Types ***/

export type TargetOf<N> = 
 N extends Node<any, any, infer T> 
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
 * A node is a component with additional functionality to determine which
 * node to transfer it's output to.
 */
export abstract class Node<
    I = unknown,
    O = unknown,
    T extends Component<O, any> = Component<O, unknown>
> extends Component<I, O> {

    /**
     * With the context of a completed computation, retrieve the target that 
     * this node is transferring it's output to.
     */
    abstract transfer(ctx: TransferContext<I,O,T>): T | null

}

export function isNode<T>(input: unknown): input is Node<T> {
    if (!isComponent(input))
        return false 

    const node = input as Partial<Node<T>>
    return typeof node.transfer === 'function'
}