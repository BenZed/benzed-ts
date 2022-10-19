import { Component, Execute } from '../component'
import { _NodeComponent, NodeInput, NodeOutput } from './_node-component'

/*** Eslint ***/

/* eslint-disable 
    @typescript-eslint/no-explicit-any, 
    @typescript-eslint/explicit-function-return-type 
*/

/*** Types ***/

/**
 * Context passed to a transfer method
 */
export interface TransferContext<
    I = unknown,
    O = unknown,
    T extends Component<O, any> = Component<O, unknown>
> extends NodeInput<I, O, T> {

    output: O

}

/**
 * Method used to compute the next target
 */
export interface Transfer<
    I = unknown,
    O = unknown,
    T extends Component<O, any> = Component<O, unknown>
> {
    (ctx: TransferContext<I, O, T>): T | null
}

/*** Node ***/

/**
 * Abstract node that would be extended for most advanced cases
 */
export abstract class _Node<
    I = unknown,
    O = unknown,
    T extends Component<O, any> = Component<O, unknown>
> extends _NodeComponent<I, O, T> {
 
    /*** Implementation ***/
    
    protected abstract _transfer(ctx: TransferContext<I,O, T>): T | null

    protected abstract _execute: Execute<I,O>

    public execute({ input, targets }: NodeInput<I, O, T>): NodeOutput<O, T> {

        const output = this
            ._execute(input)

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
