import { Component, Execute, InputOf, OutputOf } from '../component'
import { NodeComponent, NodeInput, NodeOutput } from './node-component'

/*** Eslint ***/

/* 
    eslint-disable 
        @typescript-eslint/no-explicit-any,
        @typescript-eslint/explicit-function-return-type 
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

type ExecuteTransferMethod<E extends Execute<any>> = 
    TransferMethod<Component<InputOf<E>, OutputOf<E>>>

/**
 * Node that would be extended for most cases where the transfer/execution
 * logic is related.
 */
export abstract class Node<
    C extends Component<any,any> = Component,
    T extends Component<OutputOf<C>, any> = Component<OutputOf<C>, unknown>
> extends NodeComponent<C, T> {

    /*** Static Helper ***/
    
    /**
     * Create a generic linear transfer method that redirects to the first possible node.
     */
    public static createTransfer(): TransferMethod<Component> {
        return ctx => ctx.targets[0] ?? null
    }

    public static create<E extends Execute<any>>(
        this: { createTransfer: () => ExecuteTransferMethod<E> },
        component: {
            execute: E
            isInput: (input: unknown) => input is InputOf<E>
            transfer?: ExecuteTransferMethod<E>
        }
    ): Node<Component<InputOf<E>, OutputOf<E>>>
    
    public static create<C extends Component<any>>(
        this: { createTransfer: () => TransferMethod<C> },
        component: C,
        node: {
            isInput: (input: unknown) => input is InputOf<C>
            transfer?: TransferMethod<C>
        }
    ): Node<C> 
    
    public static create(
        this: { createTransfer: () => TransferMethod<Component> },
        ...args: [any] | [any, any]
    ): Node<Component<unknown>> {
    
        const { isInput, component, transfer = this.createTransfer() } = args[1] 
            ? { 
                component: args[0],
                transfer: args[1].transfer,
                isInput: args[1].isInput
            } 
            : {
                component: { execute: args[0].execute },
                isInput: args[1].isInput,
                transfer: args[1].transfer
            }
        return new class extends Node<Component<unknown>> {
            protected _transfer = transfer
            public readonly isInput = isInput
        }(
            component
        )
    }
    
    /*** Constructor ***/
    
    public constructor(
        protected _component: C
    ) {
        super()
    }

    /*** Implementation ***/
    
    protected abstract _transfer(ctx: TransferContext<C, T>): T | null

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

