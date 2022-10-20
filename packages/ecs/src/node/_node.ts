import { Component } from '../component'

/*** Eslint ***/

/* eslint-disable 
    @typescript-eslint/no-explicit-any, 
    @typescript-eslint/explicit-function-return-type 
*/

/*** Types ***/

/**
 * Nodes get input that they are intended to execute, I, as
 * well as a list of possible targets to transfer their output to.
 */
export interface ExecuteInput<
    I = unknown,
    O = I,
    T extends Component<O, any> = Component<O, unknown>
> { 
    readonly targets: readonly T[]
    readonly input: I
}

/**
* Nodes output the result of their computation, O, as well
* as a target to transfer their output to.
*/
export interface ExecuteOutput<
    O,
    T extends Component<O, any> = Component<O, unknown>
> { 
    readonly target: T | null
    readonly output: O
}

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
> extends ExecuteInput<I, O, T> {
    output: O
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
     * Compute a nodes output and also the target it should transfer
     * that output to.
     */
    abstract execute({ input, targets }: ExecuteInput<I, O, T>): ExecuteOutput<O, T>

}
