import { Component, Execute, InputOf, OutputOf } from './component'
import { Node, TargetOf, Transfer } from './node'

import { priorityFind, resolveIndex, shuffle } from '@benzed/array'
import { StringKeys } from '@benzed/util'

/*** Eslint ***/

/* eslint-disable @typescript-eslint/no-explicit-any */

/*** Links ***/

export type Links = readonly string[]

/*** System Node ***/

export type LinksOf<N> = N extends SystemNode<any, infer L, any> ? L : []

class SystemNode<
    C extends Component<any,any>, 
    L extends Links, 
    T extends Component<OutputOf<C>,any>
> extends Node<C, T> {

    public static create<
        Cx extends Component<any,any>, 
        Tx extends Component<OutputOf<Cx>,any>
    //
    >(node: Node<Cx, Tx>): SystemNode<Cx,[], Tx> {
        return new SystemNode(node, [])
    }

    private constructor(
        node: Node<C, T>,
        public readonly links: L
    ) {
        super()

        const { transfer, execute } = (node instanceof SystemNode
            // if it was a system node, the methods are already bound
            ? node 
            : { 
                execute: node.execute.bind(node), 
                transfer: node.transfer.bind(node)
            }) as Node<C,T>

        this.execute = execute
        this.transfer = transfer
    }

    public execute!: Execute<InputOf<C>, OutputOf<C>>

    public transfer!: Transfer<InputOf<C>, OutputOf<C>, T>

    public addLink<Lx extends string>(link: Lx): SystemNode<C, [...L, Lx], T> {
        return new SystemNode(this, [...this.links, link])
    }

}

type SystemNodes = { [key: string]: SystemNode<any,any,any> }

type SystemInput<N extends SystemNodes, I extends string> = InputOf<N[I]>

type SystemOutput<N extends SystemNodes, I extends string> = OutputOf<N[I]>

type AddSystemNode = Node<any,any>

type SystemComponent<N extends SystemNodes, I extends string> =     
    Component<SystemInput<N, I>, SystemOutput<N, I>>
export class System<N extends SystemNodes, I extends string, T extends Component<any,any>> 
    extends Node<N[I], T> {

    public static create<
        Nx extends Node<any,any>, 
        Ix extends string, 
        Tx extends Component<any,any>
    >(
        node: Nx,
        inputKey: Ix
    ): System<{ [K in Ix]: SystemNode<Nx, [], Tx> }, Ix, Tx> {
        return new System({ [inputKey]: SystemNode.create(node) }, inputKey) as any
    }

    private constructor(
        public readonly nodes: Readonly<N>,
        private readonly _inputKey: I
    ) {
        super()
    }

    public execute(input: InputOf<N[I]>): OutputOf<N[I]> {
        // TODO spread to other nodes
        return this.nodes[this._inputKey].execute(input)
    }

    public transfer(ctx: { targets: T[], input: InputOf<N[I]>, output: OutputOf<N[I]> }): T | null {
        // TODO spread to other nodes
        return this.nodes[this._inputKey].transfer(ctx)
    }

    public addNode<F extends StringKeys<N>[], Tx extends string, Nx extends AddSystemNode>(
        fromKeys: F,
        toKey: Tx,
        node: Nx
    ): System<{
            [K in keyof N]: K extends Tx
                ? SystemNode<Nx, [], TargetOf<Nx>>
                : K extends F[number]
                    ? SystemNode<
                    /**/ N[K], 
                    /**/ [...LinksOf<N[K]>, Tx], 
                    /**/ TargetOf<Nx>
                    >
                    : N[K]
        }, I, T> {

        const { nodes: currentNodes, _inputKey: inputKey } = this

        const updatedNodes = fromKeys.reduce((nodes, fromKey) => ({
            ...nodes,
            [fromKey]: currentNodes[fromKey].addLink(toKey)
        }), {})

        return new System(
            {
                ...currentNodes,
                ...updatedNodes,
                [toKey]: SystemNode.create(node)
            }, 
            inputKey
        ) as any
    }
}

/*** Fucking Around ***/

const LinearNode = Node.define(() => ctx => ctx.targets.at(0) ?? null)

const RandomNode = Node.define(() => {
    
    let targets: Component<unknown, unknown>[] = []
    
    return ctx => {

        if (targets.length === 0)
            targets = shuffle(ctx.targets)

        return targets.pop() ?? null
    }
})

const SwitchNode = Node.define(() => {
    
    let targetIndex = 0

    return (ctx) => {

        const target = ctx.targets.at(targetIndex)

        targetIndex = resolveIndex(ctx.targets, targetIndex + 1)

        return target ?? null
    }
})

interface Multiply extends Component<number, number> {
    by: number
}

const multiply = RandomNode.create<Multiply>({

    by: 5,

    execute(input: number) {
        return input * this.by 
    }

})

const MultiplyNode = Node.define<Multiply>(() => {

    return ctx => {
        return priorityFind(ctx.targets,
            t => t.by === 0,
            t => t.by === 1    
        )
    }
})

const toMathNode = MultiplyNode.create((i: number) => i + 1)