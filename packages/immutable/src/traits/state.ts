import { Trait, isIntersection, AnyTypeGuard, isObject } from '@benzed/util'
import { $$copy } from '../copy'
import equals from '../equals'

import Comparable, { $$equals } from './comparable'
import Copyable from './copyable'

//// Sybol ////

const $$state = Symbol('state')

//// Main ////

abstract class State<T> extends Trait.use(Copyable, Comparable) {

    //// Static ////
    
    static readonly state: typeof $$state = $$state

    static [Trait.apply]<Tx>(trait: State<Tx>): State<Tx> {
        return trait
    }

    static override readonly is: <Tx>(input: unknown) => input is State<Tx> = isIntersection(
        Copyable.is,
        Comparable.is,
        ((input: unknown) => $$state in (input as object)) as AnyTypeGuard
    )

    //// Stateful ////
    
    abstract get [$$state](): T 

    protected abstract set [$$state](input: T)

    //// Copyable ////
    
    protected [$$copy](): this {
        const clone = Object.create(this.constructor.prototype)
        clone[$$state] = this[$$state]
        return clone
    }

    //// Comparable ////
    
    protected [$$equals](other: unknown): other is this {
        return State.is(other) && 
            other.constructor === this.constructor && 
            equals(other[$$state], this[$$state])
    }

}

//// Exports ////

export default State

export {
    State
}