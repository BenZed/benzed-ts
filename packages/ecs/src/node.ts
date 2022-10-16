import { Component, InputOf, OutputOf } from './component'

/*** Lint ***/

/* eslint-disable 
    @typescript-eslint/no-non-null-assertion,
    @typescript-eslint/no-explicit-any
*/

/*** Types ***/

type Links = readonly string[]

type LinksOf<N extends Node> = N extends Node<any,any,infer L> ? L : []

type RefOf<N extends Node> = N extends Node<any,any,any, infer R> ? R : Component 

interface Node<

    I = any, 
    O = any, 
    L extends Links = Links,
    R extends Component<O> = Component<O>

> extends Component<I, O> {

    readonly transfer: (refs: R[], input: I, output: O) => R | null 

    readonly addLink: <L1 extends string>(link: L1) => Node<I, O, [...L, L1], R>

    readonly links: L

}

/*** Factory ***/

function createNode<E extends Component, R extends Component<OutputOf<E>>>(
    component: E,
    transfer: (refs: R[], input: InputOf<E>, output: OutputOf<E>) => R | null
): Node<InputOf<E>, OutputOf<E>, [], R> {

    const node = (input: InputOf<E>): OutputOf<E> => component(input)
    node.transfer = transfer
    node.links = [] as Links
    node.addLink = (link: string) => {
        const copy = createNode(component, transfer) as { links: string[] }
        copy.links = [...node.links, link]
        return copy
    }

    return node as Node<InputOf<E>, OutputOf<E>, [], R>
}

function defineNode<R extends Component>(
    transfer: (refs: R[]) => R | null
): <I>(component: Component<I, InputOf<R>>) => Node<I, InputOf<R>, [], R>

function defineNode<I, R extends Component>(
    transfer: (refs: R[], input: I) => R | null
): (component: Component<I, InputOf<R>>) => Node<I, InputOf<R>, [], R>

function defineNode<I, O, R extends Component<O> = Component<O>>(
    transfer: (refs: R[], input: I, output: O) => R | null
): (component: Component<I, O>) => Node<I, O, [], R> {

    return component => createNode(component, transfer)

}

/*** Exports ***/

export default Node 

export {
    Node,
    LinksOf,
    RefOf,

    Links,

    createNode,
    defineNode
}