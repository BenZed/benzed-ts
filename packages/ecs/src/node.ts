import { $$copy, $$equals, CopyComparable, equals } from '@benzed/immutable'
import { Component } from './component'

/*** Types ***/

type Components = readonly Component[]

type ComponentName<T> = T extends Component<infer N> 
    ? N 
    : unknown

type ComponentNames<T> = {
    [K in keyof GetComponents<T>]: ComponentName<GetComponents<T>[K]>
}

type GetComponents<T> = T extends Components    
    ? T 
    : T extends Node<infer C> 
        ? C 
        : []

type GetComponentsNamed<C extends Components, N> = 
    C extends [ infer C1, ...infer CR ]
        ? CR extends Components 
            ? N extends ComponentName<C1>   
                ? [C1, ...GetComponentsNamed<CR, N>]
                : GetComponentsNamed<CR, N>
            : N extends ComponentName<C1> 
                ? [C1]
                : []
        : []

/*** Main ***/

class Node<
    C extends Components = Components,
> implements CopyComparable<Node<C>> {

    public static create<C1 extends Components>(...components: C1): Node<C1> {
        return new Node(...components)
    }

    public readonly components: C

    private constructor(...components: C) { 
        this.components = components
    }

    // Component Interface

    public add<C1 extends Component>(
        component: C1
    ): Node<[...C, C1]> {
        return new Node(
            ...this.components, 
            component
        )
    }

    public get<N extends ComponentNames<C>[number]>(
        name: N
    ): GetComponentsNamed<C, N> {
        const components = this
            .components
            .filter(c => c.name === name)
        
        return components as GetComponentsNamed<C,N>
    }

    // Copy Comparable Implementation 

    public [$$copy](): Node<C> {
        return new Node(...this.components)
    }

    public [$$equals](other: unknown): other is Node<C> {
        return other instanceof Node && 
            equals(this.components, other.components)
    }

}

/*** Exports ***/

export default Node

export {
    Node,
    GetComponents
}