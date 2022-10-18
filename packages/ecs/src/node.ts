import { Component, InputOf, OutputOf } from './component'

import { shuffle } from '@benzed/array'

/*** Eslint ***/

/* eslint-disable @typescript-eslint/no-explicit-any */

/*** _Node ***/

export interface NodeInput<
    I,
    O,
    T extends Component<O, any> = Component<O,unknown>
> { 
    readonly targets: readonly T[]
    readonly input: I 
}

export interface NodeOutput<
    O,
    T extends Component<O, any> = Component<O,unknown>
> { 
    readonly target: T | null
    readonly output: O 
}

/**
 * Base node for component transfer i/o
 */
export abstract class _Node<
    I = unknown,
    O = unknown,
    T extends Component<O, any> = Component<O>
> extends Component<NodeInput<I, O, T>, NodeOutput<O, T>> {
 
}

/*** Node ***/

interface TransferContext<
    I = unknown,
    O = unknown,
    T extends Component<O> = Component<O,unknown>
> extends NodeInput<I, O, T> {
    output: O
}

export type TargetOf<N> = 
    N extends TransferContext<any, infer T> | _Node<any, any, infer T> 
        ? T
        : unknown

/**
 * Node with seperated transfer & execute logic
 */
abstract class TransferNode<
    I,
    O,
    T extends Component<O,any> = Component<O, unknown>
> extends _Node<I,O,T> {

    protected abstract _transfer(ctx: TransferContext<I, O, T>): T | null

    protected abstract _execute(input: I): O

    public execute(
        { input, targets }: NodeInput<I, O, T>
    ): NodeOutput<O, T> {

        const output = this._execute(input)

        const target = this._transfer({
            input,
            output,
            targets
        })

        return {
            output,
            target
        }
    }
}

/**
 * A switch node alternates its output target on every invocation.
 */
export abstract class SwitchNode<C extends Component<any,any> = Component> 
    extends TransferNode<InputOf<C>, OutputOf<C>> {

    public constructor(
        public readonly random: boolean
    ) {
        super()
    }

    private readonly _targets: Component<OutputOf<C>>[] = []

    protected _transfer(
        ctx: TransferContext<InputOf<C>, OutputOf<C>>
    ): Component<OutputOf<C>> | null {

        const refresh = this._targets.length === 0
        if (refresh) {
            this._targets.push(...ctx.targets)
            this._targets.reverse()
        }

        if (refresh && this.random)
            shuffle(this._targets)

        return this._targets.pop() ?? null
    }
}

/**
 * The "standard" Node with decoupled transfer logic that will be used
 * in most cases.
 */
export abstract class Node<C extends Component<any,any> = Component> 
    extends TransferNode<InputOf<C>, OutputOf<C>> {

}
