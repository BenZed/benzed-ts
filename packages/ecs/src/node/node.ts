import { Component, Execute, InputOf, OutputOf } from '../component'
import { TransferMethod, TransferNode } from './transfer-node'

/*** Eslint ***/

/* 
    eslint-disable   @typescript-eslint/no-explicit-any
*/

/*** Static Type Helper ***/

type ExecuteTransferMethod<E extends Execute<any>> = 
    TransferMethod<Component<InputOf<E>, OutputOf<E>>>

/*** Node ***/

export class Node<C extends Component<any,any>> extends TransferNode<C> {
       
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
    ): Node<Component> {
    
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
        return new Node(
            component,
            transfer,
            isInput
        )
    }

    /*** Constructor ***/
    
    public constructor(
        protected _component: C,
        protected _transfer: TransferMethod<C>,
        public readonly isInput: (value: unknown) => value is InputOf<C>
    ) {
        super()
    }

}