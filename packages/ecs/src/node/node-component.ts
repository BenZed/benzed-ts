import { Component } from '../component'

/*** Eslint ***/

/* eslint-disable @typescript-eslint/no-explicit-any */

/*** Types ***/

/**
 * Nodes get input that they are intended to execute, I, as
 * well as a list of possible targets to transfer their output to.
 */
export interface NodeInput<
    I,
    O = I,
    T extends Component<O, any> = Component<O,unknown>
> { 
    readonly targets: readonly T[]
    readonly input: I 
}

/**
 * Nodes output the result of their computation, O, as well
 * as a target to transfer their output to.
 */
export interface NodeOutput<
    O,
    T extends Component<O, any> = Component<O,unknown>
> { 
    readonly target: T | null
    readonly output: O 
}

/**
 * The simplest form of node. Just a component with the expected node input/output.
 * This would only be extended for cases where the transfer/execution logic is
 * very tightly coupled.
 */
export abstract class NodeComponent<
    I = unknown,
    O = I,
    T extends Component<O, any> = Component<O, unknown>
> extends Component<NodeInput<I, O, T>, NodeOutput<O, T>> {
 
}
