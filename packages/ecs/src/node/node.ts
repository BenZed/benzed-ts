
import { pass, TypeGuard } from '@benzed/util'

import { Component, Compute, InputOf, OutputOf } from '../component'
import { Transfer,_Node } from './_node'
import { linear } from './transfers'

/*** Eslint ***/

/* eslint-disable 
    @typescript-eslint/no-explicit-any
*/

/*** Node ***/

interface PlainNode<I = unknown, O = I> extends Node<I,O, Component<O, unknown>> {}

/**
 * The standard non-abstract class that has options for quick instancing 
 */
export abstract class Node<I, O, T extends Component<O, any> = Component<O, unknown>> 
    extends _Node<I, O, T> {

    /*** Convenience Create Methods ***/
        
    /**
     * Apply node interface methods to an existing component
     */
    static apply<C extends Component<any>>(
        component: C,
        transfer: Transfer<InputOf<C>, OutputOf<C>> = linear()
    ): PlainNode<InputOf<C>, OutputOf<C>> {

        return Object.assign(
            component,
            { transfer }
        )
    }

    /**
     * Create a node that takes any input and linearly transfers it's output
     */
    static create<Ox>(compute: Compute<any,Ox>): PlainNode<any, Ox>

    /**
     * Create a new node that takes specific input and optional transfer behaviour. 
     * 
     * Transfer behaviour defaults  to linear.
     */
    static create<Ix, Ox = Ix>(
        canCompute: TypeGuard<Ix>,
        compute: Compute<Ix,Ox>,
        transfer?: Transfer<Ix,Ox>
    ): PlainNode<Ix, Ox> 

    static create(
        ...args: any[]
    ): PlainNode<any> {

        const [compute, canCompute, transfer] = args.length === 1 
            ? [args[0], pass, linear()]
            : [args[1], args[0], args[2] = linear()]

        return this.apply({ compute, canCompute }, transfer)
    }

}
