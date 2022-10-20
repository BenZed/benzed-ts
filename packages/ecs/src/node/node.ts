
import { pass, TypeGuard } from '@benzed/util/lib'
import { Component, Compute, InputOf, OutputOf } from '../component'
import { ExecuteInput, ExecuteOutput, Transfer, TransferContext, _Node } from './_node'
import { linear } from './transfers'

/*** Eslint ***/

/* eslint-disable 
    @typescript-eslint/no-explicit-any
*/

/*** Node ***/

interface PlainNode<I = unknown, O = I> extends Node<I,O> {}

/**
 * The standard non-abstract class that has options for quick instancing 
 */
export abstract class Node<I, O, T extends Component<O, any> = Component<O, unknown>> 
    extends _Node<I, O, T> {

    /*** Convenience Create Methods ***/
        
    /**
     * Apply node interface methods to an existing component
     */
    static apply<C extends Component<any>>(
        component: C,
        transfer: Transfer<InputOf<C>, OutputOf<C>> = linear()
    ): PlainNode<InputOf<C>, OutputOf<C>> {

        const { execute } = Node.prototype

        return Object.assign(
            component,
            { 
                execute,
                transfer
            }
        )
    }

    /**
     * Create a node that takes any input and linearly transfers it's output
     */
    static create<Ox>(compute: Compute<any,Ox>): PlainNode<any, Ox>

    /**
     * Create a new node that takes specific input and optional transfer behaviour. 
     * 
     * Transfer behaviour defaults  to linear.
     */
    static create<Ix, Ox = Ix>(
        canCompute: TypeGuard<Ix>,
        compute: Compute<Ix,Ox>,
        transfer?: Transfer<Ix,Ox>
    ): PlainNode<Ix, Ox> 

    static create(
        ...args: any[]
    ): PlainNode<any> {

        const [compute, canCompute, transfer] = args.length === 1 
            ? [args[0], pass, linear()]
            : [args[1], args[0], args[2] = linear()]

        return this.apply({ compute, canCompute }, transfer)
    }

    /*** Implementation ***/
    
    /**
     * With the context of a completed execution, retrieve the target that this node is 
     * transferring it's output to.
     */
    abstract transfer(ctx: TransferContext<I,O,T>): T | null

    execute({ input, targets }: ExecuteInput<I, O, T>): ExecuteOutput<O, T> {
 
        const output = this.compute(input)
 
        const target = this.transfer({
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
