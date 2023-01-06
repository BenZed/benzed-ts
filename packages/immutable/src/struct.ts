import copy, { Copyable } from './copy'
import equals, { Comparable } from './equals'
import { $$copy, $$equals } from './symbols'

//// Main ////

class Struct<T> implements Copyable, Comparable {
    
    constructor(protected readonly _state: T) {}

    protected _setState(state: T): this {
        const Construct = this.constructor as new (state: T) => this
        return new Construct(state)
    }

    [$$copy](): this {
        return this._setState(copy(this._state))
    }

    [$$equals](other: unknown): other is this {
        return other instanceof Struct && 
            other.constructor === this.constructor && 
            equals(other._state, this._state)
    }

}

//// Exports ////

export default Struct

export {
    Struct
}