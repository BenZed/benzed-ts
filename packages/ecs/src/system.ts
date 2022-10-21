
import { 
    Component,
    InputOf,
    OutputOf 
} from './component'

import { 
    _Node, 
    TargetOf, 
    
    TransferContext
} from './node'

/*** Eslint ***/

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
    @typescript-eslint/no-non-null-assertion
*/

/*** Nodes ***/

type Links = readonly string[]

type LinkedNode<S extends SystemNodes, K extends keyof S> = 
    S[K][0]

type SystemNode = [_Node<any>, ...Links] | [_Node<any>]

type SystemNodes = { [key: string]: SystemNode }

type SystemNodeOutput<S extends SystemNodes, K extends keyof S> = 
    OutputOf<LinkedNode<S,K>>

type SystemNodeInput<S extends SystemNodes, K extends keyof S> = 
    InputOf<LinkedNode<S,K>>

type SystemNodeTarget<S extends SystemNodes, K extends keyof S> = 
    TargetOf<LinkedNode<S,K>>

type ComponentAsNode<C extends Component<any>> = C extends _Node<any> 
    ? C 
    : _Node<InputOf<C>, OutputOf<C>>

type SystemOutputNodes<S extends SystemNodes> = 
    LinkedNode<S, EndLinkedKeys<S>>

export type SystemTarget<S extends SystemNodes> =
    TargetOf<SystemOutputNodes<S>> extends _Node<SystemOutput<S>, any>
        ? TargetOf<SystemOutputNodes<S>>
        : _Node<SystemOutput<S>>

export type SystemOutput<S extends SystemNodes> = 
    SystemOutputMap<S>[keyof SystemOutputMap<S>]

export type SystemInput<S extends SystemNodes, I extends string> =
    SystemNodeInput<S, I>

type SystemOutputMap<S extends SystemNodes> = {
    [K in EndLinkedKeys<S>]: Exclude<
    SystemNodeOutput<S, K>,
    SystemNodeInput<S, LinksOf<S[K]>[number]>
    >
}

type EndLinkedKeys<
    S extends SystemNodes, 
> = keyof {
    [K in keyof S as IsEndLinkKey<S, K, K, never>]: unknown
}

type IsEndLinkKey<S extends SystemNodes, K extends keyof S, Y, N> = 
    AllOutputsAreHandled<S,K,
    LinksOf<S[K]> extends [] 
        ? Y
        : N,
    Y
    >

type AllOutputsAreHandled<S extends SystemNodes, T extends keyof S, Y, N> = 
    LinksOf<S[T]> extends []
        ? N
        : Exclude<
        /**/ OutputOf<LinkedNode<S,T>>, 
        /**/ InputOf<LinkedNode<S, LinksOf<S[T]>[number]>>
        > extends never ? Y : N

type LinksOf<S extends SystemNode> = S extends [_Node<any>, ...infer L]
    ? L 
    : []

type AddLink<N extends SystemNode, L extends string> = L extends LinksOf<N>[number]
    ? N
    : [
        N[0],
        ...LinksOf<N>,
        L
    ]    

/*** System ***/

class System<S extends SystemNodes = SystemNodes, I extends string = string> 
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
        F extends (keyof S)[], 
        T extends string, 
        N extends SystemNodeTarget<S, F[number]>
    >
    (...input: [F, T, N]): System<{

        [K in keyof S | T]: K extends T 
            ? [ComponentAsNode<N>]
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

    has<K extends string>(
        key: K
    ): K extends keyof S ? true : false {
        return key in this.nodes as K extends keyof S ? true : false
    }

    get<K extends keyof S>(
        key: K
    ): LinkedNode<S, K> {

        const { nodes } = this

        if (key in nodes === false)
            throw new Error(`No node at ${key.toString()}`)

        return nodes[key][0]
    }

    getInput():LinkedNode<S, I> {
        return this.get(this._inputKey as unknown as keyof S)
    }

    canCompute(value: unknown): value is SystemNodeInput<S,I> {
        const { nodes, _inputKey } = this
        const [inputNode] = nodes[_inputKey]
        return inputNode.canCompute(value)
    }

    transfer(
        ctx: TransferContext<SystemInput<S,I>, SystemOutput<S>, SystemTarget<S>>
    ): SystemTarget<S> | null {

        const cache = this._transferCache

        // Generally, transfer is only called by a system directly after a compute, but it 
        // IS a public method, so just in case it's called for some other reason, we make
        // sure the current transfer cache data is valid.
        const requiresCompute = !cache || cache.input !== ctx.input || cache.output !== ctx.output
        if (requiresCompute)
            this.compute(ctx.input)

        return this._transferCache?.outputNode?.transfer(ctx) ?? null as any
    }

    /**
     * A system needs the output node from it's last computation in
     * order to provide a result to a .transfer() call. 
     * 
     * We cache that here to prevent the system from having
     * to run it's computation twice
     */
    private _transferCache: { 
        input: SystemInput<S, I>
        output: SystemOutput<S>
        outputNode: _Node<unknown> | null
    } | null = null
    // 

    compute(input: SystemInput<S,I>): SystemOutput<S> {

        const { nodes, _inputKey } = this

        let currentNodeKey = _inputKey as string | undefined
        let pipedInputToOutput = input as unknown
        let outputNode = null

        while (currentNodeKey !== undefined) {

            const [currentNode, ...currentLinks] = nodes[currentNodeKey]

            const currentInput = pipedInputToOutput
            const currentOutput = pipedInputToOutput = currentNode.compute(pipedInputToOutput)

            const targets = currentLinks
                .map(link => this.get(link))
                .filter(node => node.canCompute(currentOutput))

            outputNode = currentNode.transfer({
                input: currentInput,
                output: currentOutput,
                targets 
            }) as LinkedNode<S, string>

            if (!targets.includes(outputNode) && targets.length > 0) {
                this._transferCache = null
                throw new Error(
                    `Premature transfer flow termination: ${currentNodeKey} did not ` + 
                    `return a target when given links: ${currentLinks}`
                )
            }

            currentNodeKey = currentLinks[targets.indexOf(outputNode)]
        }

        const output = pipedInputToOutput as SystemOutput<S> 

        this._transferCache = { 
            input,
            output,
            outputNode
        }

        return output
    }

}

/*** Exports ***/

export default System

export {

    System

}