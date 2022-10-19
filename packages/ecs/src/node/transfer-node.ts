import { Component, OutputOf } from '../component'
import { NodeComponent, NodeInput, NodeOutput } from './node-component'

/*** Eslint ***/

/* 
    eslint-disable   @typescript-eslint/no-explicit-any
*/

/*** Types ***/

/**
 * Context passed to a transfer method
 */
export interface TransferContext<
    C extends Component<any,any> = Component,
    T extends Component<OutputOf<C>, any> = Component<OutputOf<C>, unknown>
> extends NodeInput<C, T> {
    output: OutputOf<C>
}

/**
 * Method used to compute the next target
 */
export interface TransferMethod<
    C extends Component<any,any> = Component,
    T extends Component<OutputOf<C>, any> = Component<OutputOf<C>, unknown>
> {
    (ctx: TransferContext<C,T>): T | null
}
    
/*** TransferNode ***/

/**
 * Node that would be extended for most cases where the transfer/execution
 * logic is related.
 */
export abstract class TransferNode<
    C extends Component<any,any> = Component,
    T extends Component<OutputOf<C>, any> = Component<OutputOf<C>, unknown>
> extends NodeComponent<C, T> {
 
    /*** Implementation ***/
    
    protected abstract _transfer(ctx: TransferContext<C, T>): T | null

    protected abstract _component: C

    public execute(
        { input, targets }: NodeInput<C, T>
    ): NodeOutput<C, T> {

        const output = this._component.execute(input)

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
