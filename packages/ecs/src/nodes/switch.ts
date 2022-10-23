
import { Component, Componentable, InputOf, OutputOf, ToComponent } from '../component'
import { Components, Node } from '../node'

import { IndexesOf, random, resolveIndex } from '@benzed/array'

/*** Switch Node ***/

/**
 * Switch Node Options
 */
export interface SwitchOptions {

    /**
     * Randomize the component this node alternates to on next invocation
     */
    random: boolean
}

/**
 * A switch node alternates the component it uses on each compute invocation
 */
export class Switch<I, O, C extends Components<I, O>> extends Node<I, O, C> {

    static create<Cx extends Componentable>(
        comp: Cx,
        options: SwitchOptions = { random: false }
    ): Switch<InputOf<Cx>, OutputOf<Cx>, [ToComponent<Cx>]> {

        const component = Component.from(comp)

        return new Switch<InputOf<Cx>, OutputOf<Cx>, [ToComponent<Cx>]>(
            [component], 
            options
        )
    }

    private constructor(
        components: C,
        readonly options: SwitchOptions
    ) {
        super(components)
    }

    // Node Implementation

    add<Cx extends Componentable<I, unknown>>(
        comp: Cx
    ): Switch<I, O | OutputOf<Cx>, [...C, ToComponent<Cx>]> {
        
        const { options, components } = this

        return new Switch(
            [
                ...components, 
                Component.from(comp)
            ],
            {...options}
        )
    }

    // Component Implementation
    
    compute(input: I): O {
        const component = this.get(this._index)

        this._switchIndex()

        return component.compute(input) as O
    }

    // State
    
    private _index = 0 as IndexesOf<C>[number]

    // Helper 
    
    private _switchIndex(): void {

        const { components, options, _index: index } = this

        const nextIndex = options.random 

            ? components.indexOf(
                random(components)
            )

            : resolveIndex(
                components, 
                index as number + 1
            ) 

        this._index = nextIndex as IndexesOf<C>[number]
    }

}