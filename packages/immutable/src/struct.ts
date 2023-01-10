import { Callable, Func } from '@benzed/util'

import { ValueCopy } from './copy'
import { $$copy, $$equals } from './symbols'
import equals, { ValueEqual } from './equals'

//// Implementation ////

abstract class Struct implements ValueCopy, ValueEqual {

    static get Callable(): typeof StructCallable {
        return StructCallable
    } 

    static [Symbol.hasInstance](input: unknown): boolean {
        return Callable[Symbol.hasInstance].call(this, input)
    }

    //// Construct ////
    
    constructor() {
        return this.initialize()
    }

    initialize(): this {
        return this
    }

    //// Copyable ////
    
    copy(): this {

        const state = Object.getOwnPropertyDescriptors({ ...this })

        return Object.create(this, state).initialize()
    }

    [$$copy](): this {
        return this.copy()
    }
    
    //// Comparable ////

    /**
     * Returns true if provided value is an instance of this
     * struct with a value equal state.
     */
    equals(other: unknown): other is this {
        return (
            other instanceof Struct && 
            other.constructor === this.constructor && 
            equals({ ...other }, { ...this })
        )
    }
    
    [$$equals](other: unknown): other is this {
        return this.equals(other)
    }

} 

//// CallableStruct ////

type StructCallable = abstract new <F extends Func>(f: F) => F & Struct

const StructCallable = class extends Struct {

    constructor(private _signature: Func) {
        super()
        return Callable.create(_signature, this)
    }

    override initialize(): this {
        if (this instanceof Callable) {
            this._signature = Callable.signatureOf(this as unknown as Func)
            console.log(this)
            return this
        }

        return Callable.create(this._signature, this) as this
        
    }

} as StructCallable

//// Exports ////

export default Struct

export {
    Struct,
    StructCallable
}