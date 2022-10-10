import { $$copy, $$equals, CopyComparable, equals } from '@benzed/immutable'
import { Component } from './component'

/* eslint-disable @typescript-eslint/no-explicit-any */ 

/*** Types ***/

type Components = readonly Component[]

type ComponentOutput<T> = T extends Component<unknown, infer O> 
    ? O
    : unknown

type ComponentInput<T> = T extends Component<infer I, unknown> 
    ? I
    : unknown

type LastComponent<C extends Components> = C extends [...unknown[], infer L] | [infer L]
    ? L 
    : never

type FirstComponent<C extends Components> = C extends [infer F, ...unknown[]] | [infer F]
    ? F 
    : never

type PipeComponent<C extends Components> = LastComponent<C> extends never 
    ? Component 
    : Component<ComponentOutput<LastComponent<C>>, unknown>

type GetComponents<T> = T extends Components    
    ? T 
    : T extends Node<infer C> 
        ? C 
        : []

type NodeInput<N extends Node> = 
    ComponentInput<
    /**/ FirstComponent<
    /*    */ GetComponents<N>
    /**/ >
    >

type NodeOutput<N extends Node> = 
    ComponentOutput<
    /**/ LastComponent<
    /*    */ GetComponents<N>
    /**/ >
    >

/*** Main ***/

class Node<
    C extends Components = Components,
> implements CopyComparable<Node<C>> {

    public static create<C1 extends Component>(component: C1): Node<[C1]> {
        return new Node(component)
    }

    public static empty(): Node<[]> {
        return new Node()
    }

    public readonly components: C

    private constructor(...components: C) { 
        this.components = components
    }

    // Component Interface

    public push<C1 extends PipeComponent<C>>(
        component: C1
    ): Node<[...C, C1]> {
        return new Node(
            ...this.components, 
            component
        )
    }

    public execute(data: ComponentInput<C>): ComponentOutput<C> {
        
        for (const component of this.components) 
            data = component.execute(data) as ComponentInput<C>

        return data as ComponentOutput<C>
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
    NodeInput,
    NodeOutput,
    GetComponents,
    Components
}