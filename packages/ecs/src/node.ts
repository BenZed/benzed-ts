import { $$copy, $$equals, CopyComparable, equals } from '@benzed/immutable'
import { Component } from './component'

/* eslint-disable @typescript-eslint/no-explicit-any */ 

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
    : T extends Node<infer C, any> 
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
    C extends Components = [],
    N extends readonly Node<any, any>[] = []
> implements CopyComparable<Node<C, N>> {

    private readonly _components: C

    public constructor(
        ..._components: C
    ) {
        this._components = _components
    }

    // Component Interface

    public addComponent<C1 extends Component>(
        component: C1
    ): Node<[...C, C1], N> {
        return new Node(
            ...this._components, component
        ) as Node<[...C, C1], N> 
    }

    public getComponents<N extends ComponentNames<C>[number]>(
        name: N
    ): GetComponentsNamed<C, N> {
        const components = this._components.filter(c => c.name === name)
        return components as GetComponentsNamed<C,N>
    }

    // Copy Comparable Implementation 

    public [$$copy](): Node<C, N> {
        return new Node(...this._components)
    }

    public [$$equals](other: unknown): other is Node<C, N> {
        return other instanceof Node && 
            equals(this._components, other._components)
    }

}

/*** Exports ***/

export default Node

export {
    Node
}