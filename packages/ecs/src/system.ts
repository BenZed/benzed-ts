import { StringKeys } from '@benzed/util'
import { InputOf, OutputOf } from './component'

import { _Node, TargetOf, NodeInput, NodeOutput } from './node'

/*** Eslint ***/

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
    @typescript-eslint/no-non-null-assertion
*/

/*** Nodes ***/

type Links = readonly string[]

type LinkedNode = [_Node, ...Links] | [_Node]

type LinkedNodes = { [key: string]: LinkedNode }

type NodesInput<S extends LinkedNodes, I extends string> = 
    InputOf<S[I][0]>

type NodesOutput<S extends LinkedNodes, I extends string> = 
    OutputOf<EndLinkedNodes<S, I>>

type EndLinkedNodes<
    S extends LinkedNodes, 
    L extends keyof S
> = 
    {
        [K in L]: LinksOf<S[K]> extends [] 
            ? S[K][0]
            : EndLinkedNodes<S, LinksOf<S[K]>[number] | EndLinkKeys<S, L>>
    }[L]

type LinksOf<S extends LinkedNode> = S extends [_Node, ...infer L]
    ? L 
    : []

type EndLinkKeys<S extends LinkedNodes, L extends keyof S> = keyof {
    [K in L as LinksOf<S[K]> extends [] ? K : never]: unknown
}

type AddLink<N extends LinkedNode, L extends string> = [
    N[0],
    ...LinksOf<N>,
    L
]

type AddNode<S extends LinkedNodes, F extends StringKeys<S>> = 
    _Node<any, InputOf<TargetOf<S[F][0]>>, TargetOf<S[F][0]>>

/*** System ***/

class System<S extends LinkedNodes = LinkedNodes, I extends string = string> 
    extends _Node<NodesInput<S,I>, NodesOutput<S,I>> {
        
    public static create<Ix extends string, N extends _Node>(
        ...input: [Ix, N]
    ): System<{ [K in Ix]: [N] }, Ix> {

        const [ name, entity ] = input

        return new System({ [name]: [entity] }, name) as any
    }

    public get input(): _Node<NodesOutput<S,I>> {
        return this.nodes[this._inputKey][0]
    }
    
    private constructor(
        public readonly nodes: S,
        private readonly _inputKey: I,
    ) {
        super() 
    }
    
    public link<
        F extends StringKeys<S>[], 
        T extends string, 
        N extends AddNode<S, F[number]>
    >(...input: [F, T, N]): System<{

        [K in StringKeys<N> | T]: K extends T 
            ? [N]
            : K extends F[number]
                ? AddLink<S[K], T> 
                : S[K]
    }, I> {

        const [ fromKeys, toKey, node ] = input

        const { nodes: currentNodes, _inputKey: inputKey } = this

        const updatedNodes = fromKeys.reduce((nodes, fromKey) => ({
            ...nodes,
            [fromKey]: [currentNodes[fromKey][0], ...currentNodes[fromKey].slice(1)]
        }), {})

        return new System(
            {
                ...currentNodes,
                ...updatedNodes,
                [toKey]: [node]
            }, 
            inputKey
        ) as any
    }

    public execute(
        {
            input, 
            targets: outerTargets
        }: NodeInput<NodesInput<S,I>, NodesOutput<S,I>, TargetOf<S[I][0]>>,
    ): NodeOutput<NodesOutput<S,I>, TargetOf<S[I][0]>> {

        const { nodes, _inputKey } = this

        let currentNodeKey = _inputKey as string | undefined
        let result = {
            output: input,
            target: null
        } as any

        while (currentNodeKey !== undefined) {

            const [currentNode, ...currentLinks] = nodes[currentNodeKey]

            const hasLinks = currentLinks.length > 0
            const targets = hasLinks
                ? currentLinks.map(link => nodes[link][0])
                : outerTargets
                
            result = currentNode.execute({
                targets,
                input
            })

            if (!targets.includes(result.target) && hasLinks) {
                throw new Error(
                    `Premature transfer flow termination: ${currentNodeKey} did not ` + 
                    `return a component when given links: ${currentLinks}`
                )
            }

            currentNodeKey = currentLinks.at(targets.indexOf(result.target))

            // result.target is going to be from a different system
            if (targets === outerTargets)
                break
        }

        return result
    }
}

/*** Exports ***/

export default System

export {

    System

}