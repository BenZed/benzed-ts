import Node, { NodeInput, NodeOutput, Components } from './node'
import { Compile } from '@benzed/util'
import Component from './component'

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
    @typescript-eslint/ban-types
*/

/*** Types ***/

type Nodes = { readonly [key: string]: Node<[Component, ...Components]> }

type Link<N extends Nodes> = readonly [input: keyof N, output:keyof N]

type MergeNodes<N extends Nodes, N1 extends Nodes> = Compile<N & N1, Node | Component>

type MergeLinks<
    N extends Nodes, 
    L extends readonly unknown[]
> = {
    [K in keyof L]: L[K] extends [keyof N, keyof N] ? L[K] : never
}

type AddLink<
    N1 extends Nodes,
    N2 extends Nodes,
    L extends readonly Link<N1>[],
    L1 
> = L1 extends Link<MergeNodes<N1, N2>> 
    ? [
        ...MergeLinks<MergeNodes<N1, N2>, L>, 
        L1
    ] 
    : MergeLinks<MergeNodes<N1, N2>, L>

type Outputs<N extends Nodes> = {
    [K in keyof N]: NodeOutput<N[K]>
}

type Inputs<N extends Nodes> = {
    [K in keyof N]: NodeInput<N[K]>
}

type LinksFrom<N extends Nodes, F> = keyof {
    [K in keyof N as Outputs<N>[K] extends F ? K : never]: unknown
}

type LinksTo<N extends Nodes, T> = keyof {
    [K in keyof N as Inputs<N>[K] extends T ? K : never]: unknown
}

/*** Main ***/

class System<
    N extends Nodes,
    L extends readonly Link<N>[] = []
> {

    public static create<N1 extends Nodes = {}>(nodes?: N1): System<N1, []> {
        return new System(nodes ?? {}, []) as System<N1, []>
    }

    private constructor(
        public readonly nodes: N,
        public readonly links: L
    ) { }

    public merge<N1 extends Nodes>(nodes: N1): System<MergeNodes<N, N1>, MergeLinks<N & N1, L>> {
        return new System(
            {
                ...this.nodes,
                ...nodes
            },
            this.links
        ) as any
    }

    public link<F extends keyof N, T extends LinksTo<N, Outputs<N>[F]>>(
        from: F,
        to: T
    ): System<N, [...L, [F,T]]> {
        return new System(
            this.nodes, 
            [...this.links, [from, to]]
        )
    }

    public add<N1 extends Nodes, F extends LinksFrom<N, Inputs<N1>[keyof N1]>,>(
        from: F, 
        nodes: N1
    ): System<
        MergeNodes<N, N1>, 
        AddLink<N, N1, L, [F, keyof N1]>
        > {
        return new System(
            {
            
                ...this.nodes,
                ...nodes
            
            },
            [
                ...this.links, 
                ...Object.keys(nodes).map(key => [from, key])

            ] as readonly Link<N & N1>[]
        ) as any
    }

}

/*** Exports ***/

export default System 

export { System }