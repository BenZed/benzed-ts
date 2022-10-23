
import { 
    Component,
    FromComponent,
    InputOf, 
    OutputOf, 
    ToComponent 
} from '../component'

import { 
    Node,
    Components
} from '../node'

import { 
    First, 
    Last 
} from '@benzed/array'

/*** Pipe Component ***/

type PipeInput<C extends Components> = InputOf<First<C>>

type PipeOutput<C extends Components> = OutputOf<Last<C>>

/**
 * Components added onto the end of a pipe must take a subset of the
 * pipes output as input
 */
type PipeAdd<C extends Components, Cx extends FromComponent<unknown>> = 
    PipeOutput<C> extends InputOf<Cx> 
        ? Cx
        : FromComponent<
        /**/ Exclude<PipeOutput<C>, InputOf<Cx>>, 
        /**/ OutputOf<Cx>
        >

/**
 * The pipe component passes its input through a series of components
 */
export class Pipe<C extends Components> extends Node<PipeInput<C>, PipeOutput<C>, C> {

    static create<Cx extends FromComponent>(
        comp: Cx
    ): Pipe<[ToComponent<Cx>]> {

        const component = Component.from(comp)

        return new Pipe([component])
    }

    private constructor(
        components: C
    ) {
        super(components) 
    }

    // Node Implementation

    add<Cx extends FromComponent>(
        component: PipeAdd<C, Cx>
    ): Pipe<[...C, ToComponent<Cx>]> {

        const { components } = this

        return new Pipe([
            ...components, 
            Component.from(component as Cx)
        ])
    }

    // Component Implementation

    compute(input: PipeInput<C>): PipeOutput<C> {

        let output = input as PipeOutput<C>
        for (const component of this.components)
            output = component.compute(output) as PipeOutput<C>
    
        return output
    }

}

