import Node from './node'
import { Compile, StringKeys } from '@benzed/util'
import Component from './component'

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
    @typescript-eslint/ban-types
*/

/*** Types ***/

type Nodes = { readonly [key: string]: Node<any> }

type Link<N extends Nodes> = readonly [input: StringKeys<N>, output: StringKeys<N>]

type ApplyNodes<N extends Nodes, N1 extends Nodes> = Compile<N & N1, Node | Component>

type ApplyLinks<
    N extends Nodes, 
    L extends readonly unknown[]
> = {
    [K in keyof L]: L[K] extends [StringKeys<N>, StringKeys<N>] ? L[K] : never
}

type AddLink<
    N1 extends Nodes,
    N2 extends Nodes,
    L extends readonly Link<N1>[],
    L1 
> = L1 extends Link<ApplyNodes<N1, N2>> 
    ? [
        ...ApplyLinks<ApplyNodes<N1, N2>, L>, 
        L1
    ] 
    : ApplyLinks<ApplyNodes<N1, N2>, L>

/*** Main ***/

class Graph<
    N extends Nodes,
    L extends readonly Link<N>[] = []
> {

    public static create<N1 extends Nodes = {}>(nodes?: N1): Graph<N1, []> {
        return new Graph(nodes ?? {}, []) as Graph<N1, []>
    }

    private constructor(
        public readonly nodes: N,
        public readonly links: L
    ) { }

    public apply<N1 extends Nodes>(nodes: N1): Graph<ApplyNodes<N, N1>, ApplyLinks<N & N1, L>> {
        return new Graph(
            {
                ...this.nodes,
                ...nodes
            },
            this.links
        ) as any
    }

    public link<L1 extends Link<N>>(...link: L1): Graph<N, [...L, L1]> {
        return new Graph(
            this.nodes, 
            [...this.links, link]
        )
    }

    public add<O extends StringKeys<N>, N1 extends Nodes>(
        output: O, 
        nodes: N1
    ): Graph<
        ApplyNodes<N, N1>, 
        AddLink<N, N1, L, [O, StringKeys<N1>]>
        > {
        return new Graph(
            {
            
                ...this.nodes,
                ...nodes
            
            },
            [
                ...this.links, 
                ...Object.keys(nodes).map(key => [output, key])

            ] as readonly Link<N & N1>[]
        ) as any
    }

}

/*** Exports ***/

export default Graph 

export {
    Graph
}