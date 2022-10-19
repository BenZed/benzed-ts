import { TypeGuard } from '@benzed/util/lib'
import { Component, Execute } from '../component'
import transfer from './transfers'
import { _Node, NodeInput, NodeOutput } from './_node'

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

/*** TransferNode ***/

/**
 * Node that would be extended for most cases where the transfer/execution
 * logic is related.
 */
export abstract class Node<
    I = unknown,
    O = unknown,
    T extends Component<O, any> = Component<O, unknown>
> extends _Node<I, O, T> {

    public static define<
        Ix = unknown, 
        Ox = unknown,
        Tx extends Component<Ox, any> = Component<Ox, unknown>>
    (
        options: {
            execute: Execute<Ix,Ox>
            is: TypeGuard<Ix>
            transfer?: Transfer<Ix,Ox,Tx>
        }
    ) {

        return class extends Node<Ix, Ox, Tx> {

            public static create() {
                return new this()
            }

            public _execute = options.execute
            public _is = options.is
            public _transfer =
                options.transfer ?? transfer.linear() as unknown as Transfer<Ix,Ox,Tx>
        }
    }
 
    /*** Implementation ***/
    
    protected abstract _transfer(ctx: TransferContext<I,O, T>): T | null

    protected abstract _execute: Execute<I,O>

    public execute({ input, targets }: NodeInput<I, O, T>
    ): NodeOutput<O, T> {

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
