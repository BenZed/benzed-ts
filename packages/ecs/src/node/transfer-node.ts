import { Component } from '../component'
import { NodeComponent, NodeInput, NodeOutput } from './node-component'

/*** Eslint ***/

/* eslint-disable @typescript-eslint/no-explicit-any */

/*** Node ***/

/**
 * Context passed to a transfer method
 */
export interface TransferContext<
    I = unknown,
    O = unknown,
    T extends Component<O, any> = Component<O,unknown>
> extends NodeInput<I, O, T> {
    output: O
}

/**
 * Method used to compute the next target
 */
export interface TransferMethod<
    I = unknown,
    O = unknown,
    T extends Component<O, any> = Component<O,unknown>
> {
    (ctx: TransferContext<I,O,T>): T | null
}

/**
 * Node that would be extended for most cases where the transfer/execution
 * logic is related.
 */
export abstract class TransferNode<
    I,
    O,
    T extends Component<O,any> = Component<O, unknown>
> extends NodeComponent<I,O,T> {

    protected abstract _transfer(ctx: TransferContext<I, O, T>): T | null

    protected abstract _execute(input: I): O

    public execute(
        { input, targets }: NodeInput<I, O, T>
    ): NodeOutput<O, T> {

        const output = this._execute(input)

        const target = this._transfer({
            input,
            output,
            targets
        })

        return {
            output,
            target
        }
    }
}

