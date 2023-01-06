import copy, { Copyable } from './copy'
import equals, { Comparable } from './equals'
import { $$copy, $$equals } from './symbols'

//// Main ////

class Struct<T> implements Copyable, Comparable {
    
    constructor(protected _state: T) {}

    protected _setState(state: T): this {
        this._state = state
        return this
    }

    //// Copyable ////

    copy(): this {
        return this[$$copy]()
    }
    
    [$$copy](): this {
        const struct = Object.create(this.constructor.prototype) as this
        const state = copy(this._state)
        
        return struct._setState(state)
    }

    //// Comparable ////

    equals(other: unknown): other is this {
        return this[$$equals](other)
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