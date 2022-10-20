import { StringKeys } from '@benzed/util'

import { 
    InputOf,
    OutputOf 
} from './component'

import { 
    _Node, 
    TargetOf, 
    
    ExecuteInput,
    ExecuteOutput
} from './node'

/*** Eslint ***/

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
    @typescript-eslint/no-non-null-assertion
*/

/*** Nodes ***/

type Links = readonly string[]

type LinkedNode = [_Node<any>, ...Links] | [_Node<any>]

type LinkedNodes = { [key: string]: LinkedNode }

type LinkedNodeOutput<S extends LinkedNodes, K extends keyof S> = 
    OutputOf<S[K][0]>

type LinkedNodeInput<S extends LinkedNodes, K extends keyof S> = 
    InputOf<S[K][0]>

export type SystemTarget<S extends LinkedNodes> =
    TargetOf<S[EndLinkedKeys<S>][0]>

export type SystemOutput<S extends LinkedNodes> = 
    SystemOutputMap<S>[keyof SystemOutputMap<S>]

export type SystemInput<S extends LinkedNodes, I extends string> =
    LinkedNodeInput<S, I>

type SystemOutputMap<S extends LinkedNodes> = {
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
        /**/ OutputOf<S[T][0]>, 
        /**/ InputOf<S[LinksOf<S[T]>[number]][0]>
        > extends never ? Y : N

type LinksOf<S extends LinkedNode> = S extends [_Node<any>, ...infer L]
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
    extends _Node<SystemInput<S,I>, SystemOutput<S>, SystemTarget<S>> {
        
    static create<Ix extends string, N extends _Node<any>>(
        ...input: [Ix, N]
    ): System<{ [K in Ix]: [N] }, Ix> {

        const [ name, node ] = input

        return new System({ [name]: [node] }, name) as any
    }

    private constructor(
        readonly nodes: S,
        private readonly _inputKey: I,
    ) {
        super() 
    }
    
    link<
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

    get<K extends StringKeys<S>>(
        key: K
    ): S[K][0] {

        if (key in this.nodes === false)
            throw new Error(`No node at ${key}`)

        return this.nodes[key][0]
    }

    has<K extends string>(
        key: K
    ): K extends StringKeys<S> ? true : false {
        return key in this.nodes as K extends StringKeys<S> ? true : false
    }

    compute(input: SystemInput<S,I>): SystemOutput<S> {

        const { output } = this.execute({
            input,
            targets: []
        })

        return output
    }

    canCompute(value: unknown): value is LinkedNodeInput<S,I> {
        const { nodes, _inputKey } = this
        const [inputNode] = nodes[_inputKey]
        return inputNode.canCompute(value)
    }

    execute(
        {
            input, 
            targets: outerTargets
        }: ExecuteInput<SystemInput<S,I>, SystemOutput<S>, SystemTarget<S>>,
    ): ExecuteOutput<SystemOutput<S>, SystemTarget<S>> {

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
                ? currentLinks.map(link => this.get(link as StringKeys<S>))
                : outerTargets as unknown as _Node[]
            ).filter(node => node.canCompute(result.output))
                
            result = currentNode.execute({
                targets,
                input: result.output
            })

            if (!targets.includes(result.target) && targets.length > 0) {
                throw new Error(
                    `Premature transfer flow termination: ${currentNodeKey} did not ` + 
                    `return a target when given links: ${currentLinks}`
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