import { First, IndexesOf, Last } from '@benzed/array'
import is from '@benzed/is'

import { Component } from './component'

/*** Eslint ***/

/* eslint-disable @typescript-eslint/no-explicit-any */

/*** Types ***/

/**
 * Array of Components
 */
export type Components<I = unknown, O = I> = readonly Component<I,O>[]

type GetComponentByConstructor<C extends Components, Cx extends new () => C[number]> = 
    C extends [infer I, ...infer Ir] 
        ? I extends InstanceType<Cx> 
            ? I
            : Ir extends Components 
                ? GetComponentByConstructor<Ir, Cx> 
                : never
        : never

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

    get<I extends IndexesOf<C>>(index: I): C[I] 
    get<Cx extends new () => C[number]>(constructor: Cx): GetComponentByConstructor<C, Cx>
    get(input: unknown): unknown {

        const component = is.number(input) 
            ? this.components[input]
            : this.components.find(component => component instanceof (input as any))
    
        if (!component) {
            throw new Error(
                'Could not find component ' + (
                    is.number(input) 
                        ? `at index ${input}` 
                        : `of type ${(input as any).name}`
                )
            )
        }

        return component
    }

    get first(): First<C> {
        return this.components.at(0) as First<C>
    }

    get last(): Last<C> {
        return this.components.at(-1) as Last<C>
    }

}