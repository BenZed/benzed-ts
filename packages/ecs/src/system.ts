import { StringKeys } from '@benzed/util'
import Entity from './entity'
import Node, { Links, NodeInput, NodeOutput } from './node'

/*** Eslint ***/

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
    @typescript-eslint/no-non-null-assertion
*/

/*** System ***/

type Nodes = { [key: string]: Node | System }

type NodeRefs<N extends Nodes, L extends Links> = L extends [infer L1, ...infer LR]
    ? L1 extends keyof N 
        ? LR extends Links
            ? [N[L1], ...NodeRefs<N, LR>]
            : [N[L1]]
        : LR extends Links ? NodeRefs<N, LR> : []
    : []

type SystemInput<N extends Nodes, I extends string> = N[I] extends Node<infer E, infer L> 
    ? NodeInput<E, NodeRefs<N, L>[number]>
    : never

type SystemOutput<N extends Nodes, I extends string> = 
    EndLinkNodes<N, I> extends Node<infer E, infer L> 
        ? NodeOutput<E, NodeRefs<N, L>[number]>
        : never

type _NodeLinks<N extends Node> = N extends Node<Entity, infer L, Entity> 
    ? L 
    : []

type NodeLinks<N extends Node | System> = 
    N extends System<infer N1, infer I> 
        ? N1[I] extends Node ? NodeLinks<N1[I]> : []    
        : N extends Node ? _NodeLinks<N> : []

type _NodeRef<N extends Node> = N extends Node<Entity, Links, infer R> 
    ? R
    : Entity

type NodeRef<N extends Node | System> = 
    N extends System<infer N1, infer I> 
        ? N1[I] extends Node ? _NodeRef<N1[I]> : never
        : N extends Node ? _NodeRef<N> : never

type EndLinks<N extends Nodes, L extends keyof N> = keyof {
    [K in L as NodeLinks<N[K]> extends [] ? K : never]: unknown
}

type EndLinkNodes<N extends Nodes, L extends keyof N> = {
    [K in L]: NodeLinks<N[K]> extends []
        ? N[K]
        : EndLinkNodes<N, NodeLinks<N[K]>[number] | EndLinks<N, L>>
}[L]

type AddLink<N extends Nodes, K extends keyof N, T extends string> = 
    N[K] extends Node<infer E, infer L, infer R> 
        ? Node<E, [...L, T], R>
        : never

class System<
    N extends Nodes = Nodes,
    I extends string = string
> extends Entity<SystemInput<N,I>, SystemOutput<N,I>> {

    public static create<N1 extends Node, I1 extends string>(
        key: I1,
        node: N1
    ): System<{ [K in I1]: N1 }, I1> {
        return new System( 
            { [key]: node }, 
            key 
        ) as any // eslint-disable-line @typescript-eslint/no-explicit-any
    }

    private constructor(
        public readonly nodes: N,
        protected readonly _inputNodeKey: I,
    ) {
        super()
    }

    public execute(
        input: SystemInput<N, I>
    ): SystemOutput<N,I> {
        return void input as unknown as SystemOutput<N,I>
    }

    public addLink<L1 extends string>(
        link: L1
    ): System<{
            [K in keyof N]: K extends I 
                ? AddLink<N, K, L1>
                : N[K]
        }, I> {

        const key = this._inputNodeKey

        return new System(
            {
                ...this.nodes,
                [key]: this.nodes[key].addLink(link)
            },
            key
        ) as any // eslint-disable-line @typescript-eslint/no-explicit-any
    }

    public link<
        F extends StringKeys<N>, 
        T extends string, N1 extends Node<NodeRef<N[F]>, 
        Links, Entity>
    >(

        fromKeys: StringKeys<N>[],
        toKey: T,
        node: N1

    ): System<{
            [K in keyof N | T]: K extends T 
                ? N1
                : K extends F[number]
                    ? AddLink<N, K, T>
                    : N[K]
        }, I>{

        return new System(

            {
                ...fromKeys.reduce(
                    (nodes, fromKey) => ({
                        ...nodes,
                        [fromKey]: nodes[fromKey].addLink(toKey)
                    }), 
                    this.nodes
                ),
                [toKey]: node
            },

            this._inputNodeKey
        ) as any // eslint-disable-line @typescript-eslint/no-explicit-any
    }
}

/*** Exports ***/

export default System

export { System }