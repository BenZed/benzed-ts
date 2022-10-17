import { Component, Execute, InputOf, OutputOf } from './component'
import { Node, TargetOf, Transfer } from './node'

import { random, resolveIndex } from '@benzed/array'
import { StringKeys } from '@benzed/util'

/*** Eslint ***/

/* eslint-disable @typescript-eslint/no-explicit-any */

/*** Links ***/

export type Links = readonly string[]

/*** System Node ***/

export type LinksOf<N> = N extends SystemNode<any,any, infer L, any> ? L : []

class SystemNode<I, O, L extends Links, T extends Component<any,any>> extends Node<I, O, T> {

    public static create<Ix, Ox, Tx extends Component<any,any>>(
        node: Node<Ix, Ox, Tx>,
    ): SystemNode<Ix,Ox,[], Tx> {
        return new SystemNode(node, [])
    }

    private constructor(
        node: Node<I,O,T>,
        public readonly links: L
    ) {
        super()

        const { transfer, execute } = node instanceof SystemNode
            // if it was a system node, the methods are already bound
            ? node 
            : { 
                execute: node.execute.bind(node), 
                transfer: node.transfer.bind(node )
            }

        this.execute = execute
        this.transfer = transfer
    }

    public execute!: Execute<I, O>

    public transfer!: Transfer<I, O, T>

    public addLink<Lx extends string>(link: Lx): SystemNode<I,O, [...L, Lx], T> {
        return new SystemNode(this, [...this.links, link])
    }

}

type SystemNodes = { [key: string]: SystemNode<any,any,any,any> }

type SystemInput<N extends SystemNodes, I extends string> = InputOf<N[I]>

type SystemOutput<N extends SystemNodes, I extends string> = OutputOf<N[I]>

type AddSystemNode = Node<any,any,any>

export class System<N extends SystemNodes, I extends string, T extends Component<any,any>> 
    extends Node<SystemInput<N, I>, SystemOutput<N, I>, T> {

    public static create<
        N1 extends Node<any,any,any>, 
        I1 extends string, 
        T1 extends Component<any,any>
    >(
        node: N1,
        inputKey: I1
    ): System<{ [K in I1]: SystemNode<InputOf<N1>, OutputOf<N1>, [], T1> }, I1, T1> {
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
                ? SystemNode<InputOf<Nx>, OutputOf<Nx>, [], TargetOf<Nx>>
                : K extends F[number]
                    ? SystemNode<
                    /**/ InputOf<N[K]>, 
                    /**/ OutputOf<N[K]>, 
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

const SwitchNode = Node.define({
    
    targetIndex: 0,

    transfer (ctx) {

        const { targetIndex } = this

        const target = ctx.targets.at(this.targetIndex)

        this.targetIndex = resolveIndex(ctx.targets, targetIndex + 1)

        return target ?? null
    }

})

class Multiply extends Component<number, number> {

    public constructor(public readonly by: number) {
        super()
    }

    public execute(input: number): number {
        return input * this.by
    }

}

function hey (): void {
    const X5 = SwitchNode.create({

        execute(input: number) {
            return input * this.by
        },

        by: 5,

    })

    const X2 = SwitchNode.create(new Multiply(2))
    
    const X3 = SwitchNode.create((i: number) => i * 3)

    const LinearNode = Node.define( ctx => ctx.targets.at(0) ?? null)

    const RandomNode = Node.define(ctx => ctx.targets.length > 0 ? random(ctx.targets) : null)
}

hey()