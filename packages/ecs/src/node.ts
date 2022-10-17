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
    input: { 
        execute: C
        transfer: Transfer<C,R>
    }
): Node<C, [], R>

function createNode<C extends Component<any>, R extends Component<OutputOf<C>>>(
    component: C | { execute: C },
    transfer: Transfer<C,R>
): Node<C, [], R>

function createNode(...input: any[]): unknown {

    const [ component, transfer ] = input.length === 1 
        ? [ input[0].execute, input[0].transfer ]
        : input

    const execute = 'execute' in component ? component.execute.bind(component): component

    const node = (input: unknown): unknown => execute(input)
    node.transfer = transfer
    node.links = [] as Links
    node.addLink = (link: string) => {
        const copy = createNode({ execute, transfer }) as any
        copy.links = [...node.links, link]
        return copy
    }

    return node
}

function defineNode<R extends Component>(
    transfer: Transfer<Component<unknown, InputOf<R>>, R>
): <C extends Component<any, InputOf<R>>>(component: C) => Node<C, [], R>

function defineNode<
    C extends Component<any>, 
    R extends Component<OutputOf<C>> = Component<OutputOf<C>>
>(transfer: Transfer<C, R>): (component: C) => Node<C, [], R> 

/**
 * Define the transfer behaviour of a node
 */
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