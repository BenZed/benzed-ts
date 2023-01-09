import { Callable, Func, isFunc } from '@benzed/util'

import { ValueCopy } from './copy'
import { $$copy, $$equals } from './symbols'
import equals, { ValueEqual } from './equals'

//// Implementation ////

abstract class Struct implements ValueCopy, ValueEqual {

    static get Callable(): typeof CallableStruct {
        return CallableStruct
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

type CallableStruct = abstract new <F extends Func>(f: F) => F & Struct

const CallableStruct = class extends Struct {

    constructor(f: Func) {
        super()
        return Callable.create(f, this)
    }

    override copy(): this {

        const clone = super.copy()

        return isFunc(this)  
            ? Callable.create(
                Callable.signatureOf(this), 
                clone
            ) as this
                
            : clone
    }

} as CallableStruct

//// Exports ////

export default Struct

export {
    Struct,
    CallableStruct
}