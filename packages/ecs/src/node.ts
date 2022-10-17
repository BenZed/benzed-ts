import { Component, InputOf, OutputOf } from './component'

/*** Lint ***/

/* eslint-disable 
    @typescript-eslint/no-non-null-assertion,
    @typescript-eslint/no-explicit-any
*/

/*** Types ***/

type Links = readonly string[]

type LinksOf<N extends Node<any,any,any>> = N extends Node<any, infer L, any> ? L : []

type TargetOf<N extends Node<any,any,any>> = N extends Node<any, any, infer R> ? R : Component 

type Transfer<S extends Component<any, any>, T extends Component<OutputOf<S>>> = 
    Component<{
        input: InputOf<S>
        output: OutputOf<S>
        source: S
        targets: T[]
    }, T | null>

interface Node<

    S extends Component<any,any> = Component,
    L extends Links = Links,
    T extends Component<OutputOf<S>, any> = Component<OutputOf<S>>

> extends Component<InputOf<S>, OutputOf<S>> {

    readonly transfer: Transfer<S,T>

    readonly addLink: <L1 extends string>(link: L1) => Node<S, [...L, L1], T>

    readonly links: L

}

/*** Factory ***/

function createNode<C extends Component<any>, R extends Component<OutputOf<C>>>(
    component: C,
    transfer: Transfer<C,R>
): Node<C, [], R> {

    const node = (input: InputOf<C>): OutputOf<C> => component(input) as OutputOf<C>
    
    node.transfer = transfer

    node.links = [] as Links

    node.addLink = (link: string) => {
        const copy = createNode(component, transfer) as { links: string[] }
        copy.links = [...node.links, link]
        return copy
    }

    return node as Node<C, [], R>
}

function defineNode<R extends Component>(
    transfer: Transfer<Component<unknown, InputOf<R>>, R>
): <C extends Component<any, InputOf<R>>>(component: C) => Node<C, [], R>

function defineNode<
    C extends Component<any>, 
    R extends Component<OutputOf<C>> = Component<OutputOf<C>>
>(transfer: Transfer<C, R>): (component: C) => Node<C, [], R> 

function defineNode(transfer: any): any {
    return (component: any) => 
        createNode(component, transfer)
}

/*** Exports ***/

export default Node 

export {
    Node,
    LinksOf,
    TargetOf,

    Links,

    createNode,
    defineNode
}