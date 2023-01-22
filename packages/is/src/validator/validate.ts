
//// EsLint ////

import { CallableStruct, Struct } from '@benzed/immutable/src'
import { provideCallableContext, InputOf, OutputOf } from '@benzed/util/src'

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

type ValidateInput<V extends AnyValidate> = InputOf<V>
type ValidateOutput<V extends AnyValidate> = OutputOf<V> extends ValidateInput<V> ? OutputOf<V> : never

interface ValidateConstructor {
    new <I, O extends I>(v: Validate<I,O>): Validate<I,O> & Struct
}

const Validate = class extends CallableStruct<Validate<unknown>> {
    constructor(validate: Validate<unknown>) {
        super(validate, provideCallableContext)
    }
} as ValidateConstructor

//// Exports ////

export default Validate

export {
    Validate,
    ValidateConstructor,
    ValidateOptions,
    ValidateInput,
    ValidateOutput,

    AnyValidate
}