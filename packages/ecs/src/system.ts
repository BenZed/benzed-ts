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

/*** Types ***/

type Nodes = { readonly [key: string]: Node<[Component, ...Components]> | System<any, any, string> }

type Link<N extends Nodes> = readonly [input: keyof N, output:keyof N]

type MergeNodes<N1 extends Nodes, N2 extends Nodes> = N1 & N2 extends infer O 
    ? { [K in keyof O]: O[K] }
    : never

type MergeLinks<
    N extends Nodes, 
    L extends readonly unknown[]
> = {
    [K in keyof L]: L[K] extends [keyof N, keyof N] ? L[K] : never
}

type MergeMain<N extends Nodes, M> = M extends StringKeys<N> ? M : void

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
    [K in keyof N]: N[K] extends Node 
        ? NodeOutput<N[K]>
        : N[K] extends System ? SystemOutput<N[K]> : never
}

type Inputs<N extends Nodes> = {
    [K in keyof N]: N[K] extends Node 
        ? NodeInput<N[K]>
        : N[K] extends System ? SystemInput<N[K]> : never
}

type LinksFrom<N extends Nodes, F> = keyof {
    [K in keyof N as Outputs<N>[K] extends F ? K : never]: unknown
}

type LinksTo<N extends Nodes, T> = keyof {
    [K in keyof N as Inputs<N>[K] extends T ? K : never]: unknown
}

type SystemInput<S extends System> = NodeInput<SystemInputNode<S>>

type SystemOutput<S extends System> = NodeOutput<SystemOutputNode<S>>

type SystemInputNode<S extends System> = S extends System<infer N, any, infer I> 
    ? I extends StringKeys<N> 
        ? N[I]
        : never
    : never

type SystemOutputNode<S extends System> = S extends System<infer N, infer L, infer I> 
    ? I extends StringKeys<N> 
        ? GetFinalLinkNode<N, I, L>
        : never
    : never

type GetFinalLinkNode<N extends Nodes, F, L> = 
    L extends [infer L1, ...infer LR]
        ? L1 extends [F, infer T]
            ? GetFinalLinkNode<N, T, LR>
            : GetFinalLinkNode<N, F, LR>
        : F extends keyof N ? N[F] : never

/*** Main ***/

class System<
    N extends Nodes = any,
    L extends readonly Link<N>[] = any,
    I extends StringKeys<N> | void = any
> {

    public static create<N1 extends Nodes = {}>(nodes?: N1): System<N1, [], void> {
        return new System(nodes ?? {}, [], undefined) as System<N1, [], void>
    }

    private constructor(
        public readonly nodes: N,
        public readonly links: L,
        public readonly main: I
    ) { }

    public setInputNode<M1 extends StringKeys<N>>(main: M1): System<N, L, M1> {
        return new System(this.nodes, this.links, main)
    }

    public merge<N1 extends Nodes>(nodes: N1): System<
    /**/ MergeNodes<N, N1>, 
    /**/ MergeLinks<N & N1, L>, 
    /**/ MergeMain<MergeNodes<N, N1>,I>
    > {
        return new System(
            {
                ...this.nodes,
                ...nodes
            },
            this.links,
            this.main
        ) as any
    }

    // @ts-expect-error Says it's circular, but I don't understand why.
    public link<F extends keyof N, T extends LinksTo<N, Outputs<N>[F]>>(
        from: F,
        to: T
    ): System<N, [...L, [F,T]], I> {
        return new System(
            this.nodes, 
            [...this.links, [from, to]],
            this.main
        )
    }

    public add<N1 extends Nodes, F extends LinksFrom<N, Inputs<N1>[keyof N1]>>(
        from: F, 
        nodes: N1
    ): System<
        MergeNodes<N, N1>, 
        AddLink<N, N1, L, [F, keyof N1]>,
        MergeMain<MergeNodes<N, N1>, I>
        > {
        return new System(
            {
                ...this.nodes,
                ...nodes
            },
            [
                ...this.links, 
                ...Object.keys(nodes).map(key => [from, key])

            ] as readonly Link<N & N1>[],
            this.main
        ) as any
    }
}

/*** Exports ***/

export default System 

export { System }

export {
    LinksTo,
    LinksFrom,
    Inputs,
    Outputs,

    SystemInputNode,
    SystemOutputNode,
    SystemInput,
    SystemOutput
}