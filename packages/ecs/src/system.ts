
import { 
    Component,
    InputOf,
    OutputOf 
} from './component'

import { 
    isNode,
    Node, 
    TargetOf, 
    
    Transfer, 
    
    TransferContext,
    transfers
} from './node'

/*** Eslint ***/

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
*/

/*** Nodes ***/

type Links = readonly string[]

type NodeOf<S extends LinkedNodes, K extends keyof S> = 
    S[K][0]

type LinkedNode = [Node<any>, ...Links] | [Node<any>]

type LinkedNodes = { [key: string]: LinkedNode }

type LinkedNodeOutput<S extends LinkedNodes, K extends keyof S> = 
    OutputOf<NodeOf<S,K>>

type LinkedNodeInput<S extends LinkedNodes, K extends keyof S> = 
    InputOf<NodeOf<S,K>>

type LinkedNodeTarget<S extends LinkedNodes, K extends keyof S> = 
    TargetOf<NodeOf<S,K>>

/**
 * A system node is a component with default transfer behaviour
 */
interface SystemNode<I,O> extends Node<I,O,Component<O, unknown>> {}
type ToSystemNode<C extends Component<any>> = C extends Node<any> 
    ? C 
    : SystemNode<InputOf<C>, OutputOf<C>>

type SystemOutputNodes<S extends LinkedNodes> = 
    NodeOf<S, EndLinkedKeys<S>>

export type SystemTarget<S extends LinkedNodes> =
    TargetOf<SystemOutputNodes<S>> extends Node<SystemOutput<S>, any>
        ? TargetOf<SystemOutputNodes<S>>
        : Node<SystemOutput<S>>

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
    AllOutputsAreHandled<S,K,
    LinksOf<S[K]> extends [] 
        ? Y
        : N,
    Y
    >

type AllOutputsAreHandled<S extends LinkedNodes, T extends keyof S, Y, N> = 
    LinksOf<S[T]> extends []
        ? N
        : Exclude<
        /**/ OutputOf<NodeOf<S,T>>, 
        /**/ InputOf<NodeOf<S, LinksOf<S[T]>[number]>>
        > extends never ? Y : N

type LinksOf<S extends LinkedNode> = S extends [Node<any>, ...infer L]
    ? L 
    : []

type AddLink<N extends LinkedNode, L extends string> = L extends LinksOf<N>[number]
    ? N
    : [
        N[0],
        ...LinksOf<N>,
        L
    ]    

/*** Helper ***/
    
function toSystemNode<C extends Component<any>>(
    nodeOrComponent: C,
    transfer: Transfer<any>
): ToSystemNode<C> {
    return (
        isNode(nodeOrComponent)
            ? nodeOrComponent 
            : Object.assign(nodeOrComponent, { transfer })
    ) as ToSystemNode<C>
}

/*** System ***/

class System<S extends LinkedNodes = LinkedNodes, I extends string = string> 
    extends Node<SystemInput<S,I>, SystemOutput<S>, SystemTarget<S>> {
        
    static create<Ix extends string, C extends Component<any> >(
        name: Ix,
        nodeOrComponent: C,
        transfer: Transfer<any> = transfers.switcher()
    ): System<{ [K in Ix]: [ToSystemNode<C>] }, Ix> {

        const node = toSystemNode(nodeOrComponent, transfer)

        return new System({ [name]: [node] }, name, transfer) as any
    }

    private constructor(
        readonly nodes: S,
        private readonly _inputKey: I,
        private readonly _defaultTransfer: Transfer<any>
    ) {
        super() 
    }
    
    link<
        F extends (keyof S)[], 
        T extends string, 
        N extends LinkedNodeTarget<S, F[number]>
    >
    (...input: [F, T, N]): System<{

        [K in keyof S | T]: K extends T 
            ? [ToSystemNode<N>]
            : K extends F[number]
                ? AddLink<S[K], T>
                : S[K]
    }, I> {

        const [ fromKeys, toKey, nodeOrComponent ] = input

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
                [toKey]: [toSystemNode(nodeOrComponent, this._defaultTransfer)]
            }, 
            inputKey,
            this._defaultTransfer
        ) as any
    }

    has<K extends string>(
        key: K
    ): K extends keyof S ? true : false {
        return key in this.nodes as K extends keyof S ? true : false
    }

    get<K extends keyof S>(
        key: K
    ): NodeOf<S, K> {

        const { nodes } = this

        if (key in nodes === false)
            throw new Error(`No node at ${key.toString()}`)

        return nodes[key][0]
    }

    getInput():NodeOf<S, I> {
        return this.get(this._inputKey as unknown as keyof S)
    }

    canCompute(value: unknown): value is LinkedNodeInput<S,I> {
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
        outputNode: Node<unknown> | null
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
            }) as NodeOf<S, string>

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