import { Callable, Func } from '@benzed/util'

import { ValueCopy, $$copy } from './copy'

import equals, { $$equals, ValueEqual } from './equals'

//// StructBase ////

abstract class Struct implements ValueCopy, ValueEqual {

    //// Copyable ////
    
    copy(): this {
        const state = Object.getOwnPropertyDescriptors({ ...this })
        const struct = Object.create(this, state)
        return struct
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

//// So that CallableStructs are also instances of Structs ////

Struct[Symbol.hasInstance] = Callable[Symbol.hasInstance]

//// CallableStruct ////

type CallableStruct = abstract new <F extends Func>(f: F) => F & Struct

const CallableStruct = class extends Struct {

    constructor(signature: Func) {
        super()
        return Callable.create(signature, this)
    }

    override copy(): this {
        const signature = Callable.signatureOf(this as unknown as Func)
        return Callable.create(signature, this) as this
    }

} as CallableStruct

//// Exports ////

export default Struct

export {
    Struct,
    CallableStruct
}