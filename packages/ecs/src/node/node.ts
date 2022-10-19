import { TypeGuard } from '@benzed/util'

import { Component, Execute, InputOf, OutputOf } from '../component'
import transfer from './transfers'
import { Transfer, _Node } from './_node'

/*** Eslint ***/

/* eslint-disable 
    @typescript-eslint/no-explicit-any, 
    @typescript-eslint/explicit-function-return-type 
*/

/*** Node ***/

/**
 * The standard non-abstract class that has options for quick instancing 
 */
export class Node<I, O, T extends Component<O,any>= Component<O, unknown>> extends _Node<I, O, T> {

    public static define<
        C extends new (...args: any[]) => Component<any>,
        T extends Transfer<
        InputOf<InstanceType<C>>, 
        OutputOf<InstanceType<C>>, 
        Component<OutputOf<InstanceType<C>>, any>
        >
    >(
        Component: C,
        is: TypeGuard<InputOf<InstanceType<C>>>,
        transfer: T
    ) {
        return class extends _Node<InputOf<InstanceType<C>>, OutputOf<InstanceType<C>>> {

            public _is = is 
            public _transfer = transfer
            public _execute: Execute<InputOf<InstanceType<C>>, OutputOf<InstanceType<C>>> 

            public constructor(
                ...args: ConstructorParameters<C>
            ) {
                super()
                const component = new Component(...args)
                this._execute = component.execute.bind(component)
            }
        }
    }

    public static create<
        Ix = unknown, 
        Ox = unknown,
        Tx extends Component<Ox, any> = Component<Ox, unknown>>
    (
        options: {
            readonly execute: Execute<Ix,Ox>
            readonly is: TypeGuard<Ix>
            readonly transfer?: Transfer<Ix,Ox,Tx>
        }
    ) {

        return new Node(
            options.execute,
            options.is,
            options.transfer
        )
    }

    public constructor(
        public _execute: Execute<I,O>,
        public _is: TypeGuard<I>,
        public _transfer: Transfer<I,O,T> = transfer.linear({ index: 0 }) as Transfer<I,O,T>
    ) {
        super()
    }

}