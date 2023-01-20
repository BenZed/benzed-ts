
//// EsLint ////

import { CallableStruct, Struct } from '@benzed/immutable/src'

/* eslint-disable 
    @typescript-eslint/no-explicit-any
*/

//// Types ////

interface ValidateOptions {
    readonly transform?: boolean
    readonly path?: readonly (symbol | string | number)[]
}

/**
 * @internal
 */
type AnyValidate = Validate<unknown>

interface Validate<I, O extends I = I> {
    (input: I, options?: ValidateOptions): O
}

interface ValidateConstructor {
    new <I, O extends I>(v: Validate<I,O>): Validate<I,O> & Struct
}

const Validate = class extends CallableStruct<Validate<unknown>> {} as ValidateConstructor

//// Exports ////

export default Validate

export {
    Validate,
    ValidateConstructor,
    AnyValidate,
    ValidateOptions
}