import { First, IndexesOf, Last } from '@benzed/array'

import { Component, Compute } from './component'

/*** Eslint ***/

/* eslint-disable @typescript-eslint/no-explicit-any */

/*** Types ***/

/**
 * Array of Components
 */
export type Components<I = unknown, O = I> = readonly Component<I,O>[]

/*** Node ***/

/**
 * Node is the base class for any component that is comprised of other components.
 * 
 * By convention, Nodes are created with a builder pattern; 
 * each extended class should have a static .create() method and 
 * a private constructor. 
 * 
 * This is to enforce type validation on components 
 */
export abstract class Node<I, O, C extends Components> extends Component<I,O> {

    constructor(
        readonly components: C
    ) {

        if (components.length === 0)
            throw new Error('Node must be created with at least one component')

        super() 
    }

    abstract add(...args: any[]): Node<any, any, any>
    
    get<I extends IndexesOf<C>>(index: I): C[I] {
        return this.components[index]
    }

    get first(): First<C> {
        return this.components.at(0) as First<C>
    }

    get last(): Last<C> {
        return this.components.at(-1) as Last<C>
    }

}