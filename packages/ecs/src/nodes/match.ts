
import { Component, FromComponent, OutputOf, ToComponent } from '../component'
import { Components, Node } from '../node'

import is from '@benzed/is'
import { TypeGuard } from '@benzed/util'

/*** Eslint ***/

/* eslint-disable @typescript-eslint/no-explicit-any */

/*** Match Node ***/

type Primitive = string | boolean | number | bigint | null | undefined 

type Matchable<I> = 
    Primitive | readonly Primitive[] | Matcher<I> | TypeGuard<I, unknown>

type Matcher<I> = (input: I) => boolean

type MatchInput<I extends Matchable<unknown>> = 
    I extends Matcher<infer Ix> | TypeGuard<infer Ix>
        ? Ix 
        : I extends readonly Primitive[]
            ? I[number]
            : I
    
type MatchOutput<C extends Components> = OutputOf<C[number]>

type MatchComponents<I> = Components<I, any>

/*** Helper ***/

function toMatcher<I>(input: unknown): Matcher<I> {

    if (is.function<Matcher<I>>(input))
        return input

    if (is.array(input))
        return (i: unknown) => input.includes(i)

    return (i: unknown) => i === input
}

/**
 * A match node picks it's output node based on a match predicate
 */
export class Match<I, C extends MatchComponents<I> = MatchComponents<I>> 
    extends Node<I, MatchOutput<C>, C> {

    /**
     * Create a switch node from an initial component
     */
    static create<Ix extends Matchable<any>, Cx extends FromComponent<MatchInput<Ix>, unknown>>(
        input: Ix,
        comp: Cx
    ): Match<MatchInput<Ix>, [ToComponent<Cx>]> {

        return new Match(
            [ toMatcher(input) ],
            [ Component.from(comp) ], 
        )
    }

    private constructor(
        private readonly _matchers: Matcher<I>[],
        components: C,
    ) {
        super(components)
    }

    // Node Implementation
    
    add<Ix extends Matchable<any>, Cx extends FromComponent<MatchInput<Ix>, unknown>>(
        input: Ix,
        comp: Cx
    ): Match<I | MatchInput<Ix>, [...C, ToComponent<Cx>]> {
        
        const { _matchers: matchers, components } = this

        return new Match(
            [
                ...matchers,
                toMatcher(input),
            ],
            [
                ...components, 
                Component.from(comp)
            ]
        )
    }

    // Component Implementation
    
    compute(input: I): MatchOutput<C> {

        const index = this._matchers.findIndex(matcher => matcher(input))
        const component = this.components[index] as C[number] | undefined
        if (!component)
            throw new Error(`Component could not be matched for input ${input}`)
        
        return component.compute(input)
    }

}