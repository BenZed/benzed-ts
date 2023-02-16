import { Trait, isIntersection, AnyTypeGuard } from '@benzed/util'
import equals from '../equals'

import Comparable from './comparable'
import Copyable from './copyable'

//// Sybol ////

const $$state = Symbol('state')

//// Main ////

abstract class State extends Trait.merge(Copyable, Comparable) {

    //// Static ////
    
    static readonly state: typeof $$state = $$state

    static [Trait.apply](trait: State): State {
        return trait
    }

    static override readonly is: (input: unknown) => input is State = 
        isIntersection(
            Copyable.is,
            Comparable.is,
            ((input: unknown) => $$state in (input as object)) as AnyTypeGuard
        )

    //// Stateful ////
    
    abstract get [$$state](): unknown 

    protected abstract set [$$state](input: unknown)

    //// Copyable ////
    
    protected [Copyable.copy](): this {
        const clone = Object.create(this.constructor.prototype)
        clone[$$state] = this[$$state]
        return clone
    }

    //// Comparable ////
    
    protected [Comparable.equals](other: unknown): other is this {
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