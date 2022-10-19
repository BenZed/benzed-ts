import { Component, InputOf, OutputOf } from '../component'

/*** Eslint ***/

/* eslint-disable @typescript-eslint/no-explicit-any */

/*** Types ***/

/**
 * Nodes get input that they are intended to execute, I, as
 * well as a list of possible targets to transfer their output to.
 */
export interface NodeInput<
    C extends Component<any,any> = Component,
    T extends Component<OutputOf<C>, any> = Component<OutputOf<C>, unknown>
> { 
    readonly targets: readonly T[]
    readonly input: InputOf<C>
}

/**
 * Nodes output the result of their computation, O, as well
 * as a target to transfer their output to.
 */
export interface NodeOutput<
    C extends Component<any,any> = Component,
    T extends Component<OutputOf<C>, any> = Component<OutputOf<C>, unknown>
> { 
    readonly target: T | null
    readonly output: OutputOf<C> 
}

export type TargetOf<N> = 
    N extends NodeComponent<any, infer T> 
        ? T
        : unknown
        
/**
 * The simplest form of node. Just a component with the expected node input/output.
 * This would only be extended for cases where the transfer/execution logic is
 * very tightly coupled.
 */
export abstract class NodeComponent<
    C extends Component<any,any> = Component,
    T extends Component<OutputOf<C>, any> = Component<OutputOf<C>, unknown>
> extends Component<NodeInput<C, T>, NodeOutput<C, T>> {

    public abstract isInput(value: unknown): value is InputOf<C>

}
