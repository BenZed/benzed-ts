import { Component, Execute, InputOf, OutputOf } from './component'
import { copy } from '@benzed/immutable'

/*** Eslint ***/

/* eslint-disable @typescript-eslint/no-explicit-any */

/*** Node Transfer ***/

type TransferInput<I,O, T extends Component<O, any>> = { targets: T[], input: I, output: O }

export type Transfer<I, O, T extends Component<O, any>> = 
    Execute<
    /**/ TransferInput<I,O,T>, 
    /**/ T | null
    >

/*** Defining Simple Nodes with Canned Transfer Behaviour ***/
    
type SimpleTransfer = Transfer<unknown, unknown, Component<unknown, unknown>>

type CreateSimpleTransferNode<C> = C extends Execute<any,any> | Component<any,any>
    ? Node<InputOf<C>, OutputOf<C>, Component<OutputOf<C>, unknown>>
    : never 

const getSimpleTransfer = (
    input: SimpleTransfer | { transfer: SimpleTransfer }
): SimpleTransfer => {
    if (typeof input === 'function')
        return input

    const transferrable = copy(input as { transfer: SimpleTransfer })
    return transferrable.transfer.bind(transferrable)
}

const getCreateSimpleTransferNodeExecute = (execute: unknown): Execute => {

    if (typeof execute === 'function')
        return execute as Execute

    const component = typeof execute === 'object' && execute !== null 
        ? copy(execute) as Partial<Component>
        : null

    if (component && typeof component.execute === 'function')
        return component.execute.bind(component)

    throw new Error('"execute" method missing from input component.')
}
    
/*** Node ***/

export type TargetOf<T> = T extends Transfer<any,any, infer T1> | Node<any, any, infer T1> 
    ? T1
    : unknown

export abstract class Node<
    I,
    O,
    T extends Component<any,any>
> extends Component<I, O> {

    /* eslint-disable @typescript-eslint/explicit-function-return-type */

    /**
     * Define a node that has canned transfer behaviour that is
     * decoupled from the rest of the nodes logic.
     * 
     * If given a transferrable object, the object will be deep-copied before
     * a new node is instanced.
     */
    public static define< Tx extends SimpleTransfer | { transfer: SimpleTransfer }>(
        simpleTransfer: Tx,
    ) {
        abstract class SimpleTransferNode<Ix,Ox> extends Node<Ix, Ox, Component<Ox>> {
  
            public static create<C>(execute: C): CreateSimpleTransferNode<C> {

                return {
                    execute: getCreateSimpleTransferNodeExecute(execute),
                    transfer: getSimpleTransfer(simpleTransfer)
                } as CreateSimpleTransferNode<C>
            }
    
            public abstract execute: Execute<Ix,Ox>
    
            public transfer = getSimpleTransfer(simpleTransfer)
        }
        
        return SimpleTransferNode
    }

    /* eslint-enable @typescript-eslint/explicit-function-return-type */

    public abstract transfer(ctx: TransferInput<I,O,T>): T | null

}
