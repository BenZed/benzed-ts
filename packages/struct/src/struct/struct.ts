import { Callable, Func } from '@benzed/util'
import { applySignature } from '../util'

//// EsLint ////

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
*/

const $$struct = Symbol('struct-name')

//// Types ////

interface Struct { 
    [$$struct]: string
}

interface StructConstructor {
    new (): Struct
    new <F extends Func>(signature: F): Struct & F
}

//// Implementation ////

const Struct = class Struct {

    static [Symbol.hasInstance] = Callable[Symbol.hasInstance]

    get [$$struct](): string {
        return this.constructor.name
    }

    constructor(signature?: Func) {
        return applySignature(this as Struct, signature)
    }

} as StructConstructor

//// Exports ////

export default Struct 

export {
    $$struct,
    Struct,
    StructConstructor
}