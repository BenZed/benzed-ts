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

type GetComponent<C extends Components, Cx extends new () => C[number]> = 
    C extends [infer I, ...infer Ir] 
        ? I extends InstanceType<Cx> 
            ? I
            : Ir extends Components 
                ? GetComponent<Ir, Cx> 
                : never
        : never

type HasComponent<C extends Components, Cx extends new () => Component<any>> = 
    InstanceType<Cx> extends C[number] 
        ? true 
        : false

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
        super() 
    }

    abstract add(...args: [unknown] | [unknown, unknown]): unknown

    has<Ix extends number>(index: Ix): Ix extends IndexesOf<C> ? true : false 
    has<T extends new () => Component>(constructor: T): HasComponent<C, T>
    has(input: unknown): unknown {
        return is.number(input) 
            ? input in this.components
            : this.components.some(component => component instanceof (input as any))
    }

    get<Ix extends IndexesOf<C>>(index: Ix): C[Ix] 
    get<T extends new () => C[number]>(constructor: T): GetComponent<C, T>
    get(input: unknown): unknown {

        const component = is.number(input) 
            ? this.components[input]
            : this.components.find(component => component instanceof (input as any))
    
        if (!component) {
            throw new Error(
                `Could not find component ` + (
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

    protected _assertAtLeastOneComponent(): void {
        if (this.components.length === 0)
            throw new Error(`Node must be created with at least one component`)
    }

}