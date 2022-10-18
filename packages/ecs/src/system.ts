import { StringKeys } from '@benzed/util'
import { InputOf, OutputOf } from './component'
import { TargetOf } from './node'

import { NodeComponent, NodeInput, NodeOutput } from './node/node-component'

/*** Eslint ***/

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
    @typescript-eslint/no-non-null-assertion
*/

/*** Nodes ***/

type Links = readonly string[]

type LinkedNode = [NodeComponent, ...Links] | [NodeComponent]

type LinkedNodes = { [key: string]: LinkedNode }

type LinkedInput<S extends LinkedNodes, I extends string> = 
    InputOf<S[I][0]>['input']

type LinkedOutput<S extends LinkedNodes> = 
    OutputOf<S[EndLinkedKeys<S>][0]> extends NodeOutput<infer O, any> 
        ? O
        : unknown

export type EndLinkedKeys<
    S extends LinkedNodes, 
> = keyof {
    [K in keyof S as IsEndLinkKey<S, K, K, never>]: unknown
}

type IsEndLinkKey<S extends LinkedNodes, K extends keyof S, Y, N> = 
    AllOutputsAreHandled<
    S, 
    K,
    LinksOf<S[K]> extends [] 
        ? Y
        : N,
    Y
    >

type AllOutputsAreHandled<S extends LinkedNodes, T extends keyof S, Y, N> = 
    Exclude<
    /**/ OutputOf<S[T][0]>['output'], 
    /**/ InputOf<S[LinksOf<S[T]>[number]][0]>['input']
    > extends never ? Y : N

type LinksOf<S extends LinkedNode> = S extends [NodeComponent, ...infer L]
    ? L 
    : []

type AddLink<N extends LinkedNode, L extends string> = [
    N[0],
    ...LinksOf<N>,
    L
]

type AddNode<S extends LinkedNodes, F extends StringKeys<S>> = 
    NodeComponent<InputOf<TargetOf<S[F][0]>>, any, any>

/*** System ***/

class System<S extends LinkedNodes = LinkedNodes, I extends string = string> 
    extends NodeComponent<LinkedInput<S,I>, LinkedOutput<S>> {
        
    public static create<Ix extends string, N extends NodeComponent>(
        ...input: [Ix, N]
    ): System<{ [K in Ix]: [N] }, Ix> {

        const [ name, node ] = input

        return new System({ [name]: [node] }, name) as any
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

        [K in StringKeys<S> | T]: K extends T 
            ? [N]
            : K extends F[number]
                ? AddLink<S[K], T>
                : S[K]
    }, I> {

        const [ fromKeys, toKey, node ] = input

        const { nodes: currentNodes, _inputKey: inputKey } = this

        const updatedNodes = fromKeys.reduce((nodes, fromKey) => ({
            ...nodes,
            [fromKey]: [
                currentNodes[fromKey][0], 
                ...currentNodes[fromKey].slice(1), 
                toKey
            ]
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
        }: NodeInput<LinkedInput<S,I>, LinkedOutput<S>, TargetOf<S[I][0]>>,
    ): NodeOutput<LinkedOutput<S>, TargetOf<S[I][0]>> {

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
                input: result.output
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