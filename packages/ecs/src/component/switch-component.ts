import { Component } from './component'
import { ComputeComponent } from './compute-component'

import { resolveIndex } from '@benzed/array'

/*** Eslint ***/

/* eslint-disable @typescript-eslint/no-explicit-any */

/*** Main ***/

/**
 * A switch component alternates which ref it sends it's input to on every invocation
 */
abstract class SwitchComponent<
    I = any, 
    O = any, 
    R extends Component<O, any, any> = Component<O, any, any>
> extends ComputeComponent<I,O,R> {

    // State 

    private _refIndex = 0

    // Override 

    protected abstract _compute(input: I): O

    protected _transfer(refs: R[]): R | null {

        const index = this._refIndex
        const next = refs.at(index) ?? null

        this._refIndex = resolveIndex(refs, index + 1)

        return next
    }

}

/*** Exports ***/

export default SwitchComponent

export {
    SwitchComponent
}