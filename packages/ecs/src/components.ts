import { IndexesOf } from '@benzed/util'
import { match } from 'assert'

import { Component, Compute, InputOf, isAny, OutputOf } from './component'

/*** Eslint ***/

/* eslint-disable @typescript-eslint/no-explicit-any */

/*** Multi Component ***/

type Components = readonly Component[]

type FirstComponent<C extends Components> = C extends [infer F, ...any] ? F : unknown

type LastComponent<C extends Components> = C extends [...any, infer L] | [infer L] ? L : unknown

type ToComponent<C extends Component<any> | Compute<any>> = C extends Component<any> 
    ? C
    : Component<InputOf<C>, OutputOf<C>>

function toComponent<C extends Component<any> | Compute<any>>(input: C): ToComponent<C> {
    return (
        typeof input === 'function' 
            ? { compute: input, canCompute: isAny } 
            : input
    ) as ToComponent<C>
}

/**
 * Base class for any component that is composed of an array of components.
 */
abstract class MultiComponent<I, O, C extends Components> extends Component<I,O> {

    constructor(
        readonly components: C
    ) {
        super() 
    }

    abstract add(component: Component<any> | Compute<any>): MultiComponent<any, any, any>
    
    get<I extends IndexesOf<C>>(index: I): C[I] {
        return this.components[index]
    }

    get first(): FirstComponent<C> {
        return this.components.at(0) as FirstComponent<C>
    }

    get last(): LastComponent<C> {
        return this.components.at(-1) as LastComponent<C>
    }

}

/*** Pipe Commponent ***/

type PipeInput<C extends Components> = InputOf<FirstComponent<C>>

type PipeOutput<C extends Components> = OutputOf<LastComponent<C>>

type PipeAdd<C extends Components, N extends Component<any> | Compute<any>> =
    PipeOutput<C> extends InputOf<N> 
        ? N 
        : Component<PipeOutput<C>, unknown>

/**
 * The pipe component passes its input through a series of components
 */
export class Pipe<C extends Components> extends 
    MultiComponent<PipeInput<C>, PipeOutput<C>, C> {

    static create<Cx extends Component<any>>(
        component: Cx): Pipe<[Cx]> {
        return new Pipe(component)
    }

    private constructor(
        ...components: C
    ) {
        super(components) 
    }

    /*** Build Interface ***/

    add<Cx extends Component<any> | Compute<any>>(
        component: PipeAdd<C, Cx>
    ): Pipe<[...C, ToComponent<PipeAdd<C, Cx>>]> {
        return new Pipe(
            ...this.components, 
            toComponent(component)
        )
    }

    /*** Component Implementation ***/

    canCompute(input: unknown): input is PipeInput<C> {
        return this.components[0].canCompute(input)
    }

    compute(input: PipeInput<C>): PipeOutput<C> {

        let output = input as PipeOutput<C>
        for (const component of this.components)
            output = component.compute(output) as PipeOutput<C>
    
        return output
    }

}

/*** Match ***/

type MatchInput<C extends Components> = InputOf<C[number]>

type MatchOutput<C extends Components> = OutputOf<C[number]>

/**
 * The filter component allows 
 */
export class Match<C extends Components> extends 
    MultiComponent<MatchInput<C>, MatchOutput<C>, C> {

    static create<Cx extends Component<any>>
    (component: Cx
    ): Match<[Cx]> {
        return new Match(component)
    }

    /*** Sealed ***/
    
    private constructor(...components: C) {
        super(components) 
    }

    /*** Build Interface ***/
    
    add<Cx extends Component<any> | Compute<any>>(
        component: Cx
    ): Match<[...C, ToComponent<Cx>]> {
        return new Match(
            ...this.components, 
            toComponent(component)
        )
    }

    /*** Component Implementation ***/
    
    canCompute(input: unknown): input is InputOf<C[number]> {
        return !!this._match(input)
    }

    compute(input: MatchInput<C>): MatchOutput<C> {
        const match = this._match(input)
        if (!match)
            throw new Error(`Could not find match for input ${input}`)

        return match.compute(input) as MatchOutput<C>
    }

    // Helper 

    private _match(input: unknown): C[number] | null {
        const matched = this
            .components
            .find(component => component.canCompute(input))
            ?? null

        return matched
    }
        
}