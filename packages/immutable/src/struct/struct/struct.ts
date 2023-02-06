import { Callable, Func } from '@benzed/util'
import { $$copy } from '../../copy'
import { equals, $$equals } from '../../equals'
import { applyState, getDeepState, getShallowState, StateApply } from '../state'
import { applySignature } from '../util'

//// EsLint ////

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
*/

//// Base Implementation ////

abstract class Structural { 
    
    static [Symbol.hasInstance] = Callable[Symbol.hasInstance]

    constructor(signature?: Func) {
        return applySignature(this, signature) as this
    }
    
    protected [$$copy](): this {
        return applyState(this, getShallowState(this) as StateApply<this>)
    }

    protected [$$equals](other: unknown): other is this {
        return other instanceof Structural && 
        this.constructor === other.constructor &&
        equals(
            getDeepState(this),
            getDeepState(other)
        )
    }

}

//// Main Types ////

type Struct = Structural

interface StructConstructor {
    new (): Struct
    new <F extends Func>(signature: F): Struct & F
}

//// Main Implementation ////

const Struct = class Struct extends Structural { } as StructConstructor

//// Exports ////

export default Struct 

export {
    Struct,
    StructConstructor
}