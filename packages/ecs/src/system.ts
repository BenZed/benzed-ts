import { StringKeys } from '@benzed/util'
import { InputOf, OutputOf } from './component'
import { TargetOf, _Node, NodeInput, NodeOutput } from './node'

/*** Eslint ***/

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
    @typescript-eslint/no-non-null-assertion
*/

/*** Nodes ***/

type Links = readonly string[]

type LinkedNode = [_Node, ...Links] | [_Node]

type LinkedNodes = { [key: string]: LinkedNode }

type LinkedNodeOutput<S extends LinkedNodes, K extends keyof S> = 
    OutputOf<S[K][0]>['output']

type LinkedNodeInput<S extends LinkedNodes, K extends keyof S> = 
    InputOf<S[K][0]>['input']

type LinkedNodeTransfer<S extends LinkedNodes> =
    TargetOf<S[EndLinkedKeys<S>][0]>

export type LinkedNodesOutput<S extends LinkedNodes> = 
    LinkedNodeOutputMap<S>[keyof LinkedNodeOutputMap<S>]

export type LinkedNodeOutputMap<S extends LinkedNodes> = {
    [K in EndLinkedKeys<S>]: Exclude<
    LinkedNodeOutput<S, K>,
    LinkedNodeInput<S, LinksOf<S[K]>[number]>
    >
}

type EndLinkedKeys<
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
    LinksOf<S[T]> extends []
        ? N
        : Exclude<
        /**/ OutputOf<S[T][0]>['output'], 
        /**/ InputOf<S[LinksOf<S[T]>[number]][0]>['input']
        > extends never ? Y : N

type LinksOf<S extends LinkedNode> = S extends [_Node, ...infer L]
    ? L 
    : []

type AddLink<N extends LinkedNode, L extends string> = L extends LinksOf<N>[number]
    ? N
    : [
        N[0],
        ...LinksOf<N>,
        L
    ]    

/*** System ***/

class System<S extends LinkedNodes = LinkedNodes, I extends string = string> 
    extends _Node<LinkedNodeInput<S,I>, LinkedNodesOutput<S>, LinkedNodeTransfer<S>> {
        
    public static create<Ix extends string, N extends _Node>(
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
        N extends _Node<OutputOf<S[F[number]][0]>, any>>
    (...input: [F, T, N]): System<{

        [K in StringKeys<S> | T]: K extends T 
            ? [N]
            : K extends F[number]
                ? AddLink<S[K], T>
                : S[K]
    }, I> {

        const [ fromKeys, toKey, node ] = input

        const { nodes: currentNodes, _inputKey: inputKey } = this

        const updatedNodes = fromKeys
            // doesn't already have key
            .filter(fromKey => !currentNodes[fromKey].slice(1).includes(toKey))
            .reduce((nodes, fromKey) => ({
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

    protected _is(value: unknown): value is LinkedNodeInput<S,I> {
        const [inputNode] = this.nodes[this._inputKey]

        return inputNode.isInput(value)
    }

    public execute(
        {
            input, 
            targets: outerTargets
        }: NodeInput<LinkedNodeInput<S,I>, LinkedNodesOutput<S>, LinkedNodeTransfer<S>>,
    ): NodeOutput<LinkedNodesOutput<S>, LinkedNodeTransfer<S>> {

        const { nodes, _inputKey } = this

        let currentNodeKey = _inputKey as string | undefined
        let result = {
            output: input,
            target: null
        } as any

        while (currentNodeKey !== undefined) {

            const [currentNode, ...currentLinks] = nodes[currentNodeKey]

            const hasLinks = currentLinks.length > 0
            const targets = (hasLinks
                ? currentLinks
                    .map(link => nodes[link][0])
                : outerTargets as unknown as _Node[]
            ).filter(c => c.isInput(result.output))
                
            result = currentNode.execute({
                targets,
                input: result.output
            })

            if (!targets.includes(result.target) && targets.length > 0) {
                throw new Error(
                    `Premature transfer flow termination: ${currentNodeKey} did not ` + 
                    `return a component when given links: ${currentLinks}`
                )
            }

            currentNodeKey = currentLinks.at(targets.indexOf(result.target))

            // next target wll be for a different system
            if (currentLinks.length === 0)
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