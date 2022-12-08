import { First, IndexesOf, Last } from '@benzed/array'
import is from '@benzed/is'

import { Component } from './component'

//// Eslint ////

/* eslint-disable @typescript-eslint/no-explicit-any */

//// Types ////

/**
 * Array of Components
 */
export type Components<I = unknown, O = I> = readonly Component<I,O>[]

type GetComponent<C extends Components, Cx extends ComponentConstructor<any, A>, A extends boolean> = 
    C extends [infer I, ...infer Ir] 
        ? I extends InstanceType<Cx> 
            ? I
            : Ir extends Components 
                ? GetComponent<Ir, Cx, A> 
                : never
        : never

type HasComponent<C extends Components, Cx extends ComponentConstructor<any, A>, A extends boolean> = 
    InstanceType<Cx> extends C[number] 
        ? true 
        : false

//// Node ////

type ComponentConstructor<C extends Components, A extends boolean = false> = 
    A extends true 
        ? abstract new (...args: any[]) => C[number]  
        : new (...args: any[]) => C[number]

/**
 * Node is the base class for any component that is comprised of other components.
 * 
 * By convention, Nodes are created with a builder pattern; 
 * each extended class should have a static .create() method and 
 * a private constructor which would be used to enforce type
 * validation on private components
 */
export abstract class Node<I, O, C extends Components> extends Component<I,O> {

    constructor(
        readonly components: C
    ) {
        super() 
        this._validateComponents()
    }

    has<Ix extends number>(index: Ix): Ix extends IndexesOf<C> ? true : false 
    has<T extends ComponentConstructor<C, A>, A extends boolean>(type: T): HasComponent<C, T, A>
    has(input: unknown): unknown {
        return is.number(input) 
            ? input in this.components
            : this.components.some(component => component instanceof (input as any))
    }

    get<Ix extends IndexesOf<C>>(index: Ix): C[Ix] 
    get<T extends ComponentConstructor<C, A>, A extends boolean>(type: T): GetComponent<C, T, A>
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

    /**
     * No validation by default, extend this method
     */
    protected _validateComponents(): void { /**/ }

    protected _assertAtLeastOneComponent(): void {
        if (this.components.length === 0)
            throw new Error('Node must be created with at least one component')
    }

    protected _assertConflicting<A extends boolean>(...types: ComponentConstructor<C, A>[]): void {
        const found = types.filter(t => this.has(t))
        if (found.length > 0)
            throw new Error(`${this.constructor.name} cannot be used with conflicting components: ${found.map(m => m.name)}`)
    }

    protected _assertRequired<A extends boolean>(...types: ComponentConstructor<C, A>[]): void {
        const missing = types.filter(t => !this.has(t))
        if (missing.length > 0)
            throw new Error(`${this.constructor.name} missing required components: ${missing.map(m => m.name)}`)
    }

    protected _assertSingle(): void {
        if (this.has(this.constructor as ComponentConstructor<C>))
            throw new Error(`${this.constructor.name} cannot be used more than once.`)
    }

}