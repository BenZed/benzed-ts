import { Component, Execute, InputOf, OutputOf } from './component'

/*** Eslint ***/

/* eslint-disable @typescript-eslint/no-explicit-any */

/*** Node Transfer ***/

export type TransferInput<
    C extends Component<any,any>, 
    T extends Component<OutputOf<C>, any>
> = { targets: T[], input: InputOf<C>, output: OutputOf<C> }

export type Transfer<
    C extends Component<any,any>,
    T extends Component<OutputOf<C>, any> = Component<OutputOf<C>,unknown>
> = 
    Execute<
    /**/ TransferInput<C,T>, 
    /**/ T | null
    >

/*** Defining Simple Nodes with Canned Transfer Behaviour ***/

const getSimpleNodeExecute = (execute: unknown): Execute => {

    if (typeof execute === 'function')
        return execute as Execute

    const component = typeof execute === 'object' && execute !== null 
        ? execute as Partial<Component>
        : null

    if (component && typeof component.execute === 'function')
        return component.execute.bind(component)

    throw new Error('"execute" method missing from input component.')
}
    
/*** Node ***/

export type TargetOf<T> = T extends Transfer<any,infer T1> | Node<any, infer T1> 
    ? T1
    : unknown

export abstract class Node<
    C extends Component<any,any>,
    T extends Component<OutputOf<C>,any>
> extends Component<InputOf<C>, OutputOf<C>> {

    /* eslint-disable @typescript-eslint/explicit-function-return-type */

    /**
     * Define a node that has reusable transfer logic
     */
    public static define<
        Tx extends Component
    >(
        createTransfer: () => Transfer<Component<unknown, InputOf<Tx>>, Tx>,
    ) {
        abstract class TransferNode<Cxx extends Component<any, InputOf<Tx>>> extends Node<Cxx, Tx> {
  
            public static create<
                E extends Execute<any, InputOf<Tx>> | Component<any, InputOf<Tx>>
            >(
                execute: E
            ): E extends Execute<any,InputOf<Tx>>
                    ? Node<Component<InputOf<E>, OutputOf<E>>, Tx>
                    : E extends Component<any, InputOf<Tx>>
                        ? Node<E, Tx>
                        : never {

                return {
                    execute: getSimpleNodeExecute(execute),
                    transfer: createTransfer()
                } as any
            }
    
            public abstract execute: Execute<InputOf<Cxx>, OutputOf<Cxx>>
    
            public transfer = createTransfer()
        }
        
        return TransferNode
    }

    /* eslint-enable @typescript-eslint/explicit-function-return-type */

    public abstract transfer(ctx: TransferInput<C, T>): T | null

}
