import { CallableStruct, Struct } from '@benzed/immutable'
import { InputOf, OutputOf } from '@benzed/util'

import { ValidateOptions } from './validate-options'

//// EsLint ////

/* eslint-disable
    @typescript-eslint/no-explicit-any
*/

//// Types ////

interface Validate<I, O = I> {
    (input: I, options?: Partial<ValidateOptions>): O
}

type AnyValidate = Validate<any>

type ValidateInput<V extends AnyValidate> = InputOf<V>

type ValidateOutput<V extends AnyValidate> = OutputOf<V>

interface ValidateConstructor {
    new <I, O>(validate: Validate<I, O>): Validate<I, O> & Struct
}

//// Implementation ////

const Validate = class extends CallableStruct<Validate<unknown>> {

    constructor(validate: Validate<unknown>) {
        super(validate)
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