import Node, {
    NodeInput, 
    NodeOutput, 
    Components 
} from './node'

import Component from './component'

import { StringKeys } from '@benzed/util'

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
    @typescript-eslint/ban-types
*/

/*** Cast Types ***/

type ToLinks<T> = T extends Links 
    ? T 
    : never

type ToNode<T> = T extends Node<any> 
    ? T
    : never

type ToSystem<T> = T extends System<any, any, any> 
    ? T
    : never

/*** Input / Output Types ***/

type SystemNode = Node<[Component, ...Components]> | System<any, any, string>

type SystemNodes = { readonly [key: string]: SystemNode }

type SystemNodesOutput<N extends SystemNodes> = {
    [K in keyof N]: N[K] extends Node 
        ? NodeOutput<N[K]>
        : SystemOutput<ToSystem<N[K]>>
}

type SystemNodesInput<N extends SystemNodes> = {
    [K in keyof N]: N[K] extends Node 
        ? NodeInput<N[K]>
        : SystemInput<ToSystem<N[K]>>
}

type SystemInput<S extends System> = NodeInput<ResolveNode<S['nodes'], S['inputNodeKey']>>

type SystemOutput<S extends System> = 
    NodeOutput< NodesAtLinkEnd<S['nodes'], S['links'], S['inputNodeKey']>[number] >

type ResolveNode<N extends SystemNodes, I extends keyof N | void> = I extends keyof N 
    ? N[I] extends System<infer N1, any, infer I1>
        ? ResolveNode<N1, I1>
        : ToNode<N[I]>
    : never

/*** Links ***/
    
type Links = { readonly [key: string]: readonly string[] }

type AddLink<
    L extends Links,
    F,
    T,
> = F extends string 
    ? ToLinks<{
        [K in keyof L | F]: K extends F ? [...L[K] extends string[] ? L[K] : [], T]: L[K]
    }> : never

type LinksFrom<N extends SystemNodes, F> = keyof {
    [K in keyof N as F extends SystemNodesOutput<N>[K] ? K : never]: unknown
}

type LinksTo<N extends SystemNodes, T> = keyof {
    [K in keyof N as T extends SystemNodesInput<N>[K] ? K : never]: unknown
}

type NodesAtLinkEnd<
    N extends SystemNodes, 
    L, 
    I, 
    N_ extends readonly Node[] = []
> = 
    SortNodesAtLinkEnd<

    I extends StringKeys<L> 
        ? L[I] extends []
            ? [...N_, N[I]]
            : NodesAtLinkEnd<N, L, L[I] extends string[] ? L[I][number] : void, N_>
        : I extends StringKeys<N> ? [...N_, N[I]] : N_

    >

type SortNodesAtLinkEnd<N> = N extends [infer N1, ...infer NR]
    ? N1 extends System<any,any,any>
        ? [
            ...NodesAtLinkEnd<N1['nodes'], N1['links'], N1['inputNodeKey']>, 
            ...SortNodesAtLinkEnd<NR>
        ]
        : N1 extends Node<any>
            ? [N1, ...SortNodesAtLinkEnd<NR>]
            : []
    : []

/*** Merge ***/

type MergeNodes<N1 extends SystemNodes, N2 extends SystemNodes> = N1 & N2 extends infer O 
    ? { [K in keyof O]: O[K] }
    : never

type MergeInputNode<N extends SystemNodes, I> = I extends StringKeys<N> ? I : void

/*** Main ***/

class System<
    N extends SystemNodes = any,
    L extends Links = any,
    I extends StringKeys<N> | void = any
> {

    public static create<N1 extends SystemNodes = {}>(nodes?: N1): System<N1, {}, void> {
        return new System(
            nodes ?? {}, 
            {}, 
            undefined as void
        ) as unknown as System<N1, {}, void>
    }

    private constructor(
        public readonly nodes: N,
        public readonly links: L,
        public readonly inputNodeKey: I
    ) { }

    public get inputNode(): ResolveNode<N, I> {
        return (
            this.inputNodeKey && 
            this.nodes[this.inputNodeKey as StringKeys<N>] as ResolveNode<N, I>
        )
    }

    public setInputNode<M1 extends StringKeys<N>>(main: M1): System<N, L, M1> {
        return new System(this.nodes, this.links, main)
    }

    public merge<N1 extends SystemNodes>(
        nodes: N1
    ): System<

        MergeNodes<N, N1>, 
        L,
        MergeInputNode<MergeNodes<N, N1>,I>

        > {
        return new System(
            {
                ...this.nodes,
                ...nodes
            },
            this.links,
            this.inputNodeKey
        ) as any
    }

    public link<F extends StringKeys<N>, T extends LinksTo<N, SystemNodesOutput<N>[F]>>(
        from: F,
        to: T
    ): System<N, AddLink<L, F, T>, I> {
        return new System(
            this.nodes, 
            { 
                ...this.links,
                [from]: [...this.links[from], to]
            },
            this.inputNodeKey
        ) as System<N, AddLink<L, F, T>, I>
    }

    public add<N1 extends SystemNodes, F extends LinksFrom<N, SystemNodesInput<N1>[keyof N1]>>(
        from: F, 
        nodes: N1
    ): System<
        MergeNodes<N, N1>, 
        AddLink<L, F, keyof N1>,
        MergeInputNode<MergeNodes<N, N1>,I>
        > {
        return new System(
            {
                ...this.nodes,
                ...nodes
            },
            {
                ...this.links,
                [from]: [
                    ...this.links[from as keyof L], 
                    ...Object.keys(nodes)
                ]
            },
            this.inputNodeKey
        ) as any
    }
}

/*** Exports ***/

export default System 

export { System }

export {

    LinksTo,
    LinksFrom,
    SystemNodesInput,
    SystemNodesOutput,

    ResolveNode,
    NodesAtLinkEnd,
    SystemInput,
    SystemOutput,
    SortNodesAtLinkEnd

}