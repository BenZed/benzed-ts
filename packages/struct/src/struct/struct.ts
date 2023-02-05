import { Callable, Func } from '@benzed/util'
import { AnyState } from '../state'
import { applySignature } from '../util'

//// EsLint ////

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
*/

//// Types ////

interface Struct extends AnyState {}

interface StructConstructor {
    new (): AnyState
    new <F extends Func>(signature: F): AnyState & F
}

//// Implementation ////

const Struct = class Struct {

    static [Symbol.hasInstance] = Callable[Symbol.hasInstance]

    constructor(signature?: Func) {
        return applySignature(this as AnyState, signature)
    }

} as StructConstructor

//// Exports ////

export default Struct 

export {
    Struct,
    StructConstructor
}