import type { InputOf, OutputOf } from '@benzed/util'

import type { ValidateOptions } from './validate-options'

//// EsLint ////

/* eslint-disable
    @typescript-eslint/no-explicit-any
*/

//// Types ////

interface Validate<I, O = I> {
    (input: I, options?: Partial<ValidateOptions>): O
}

type ValidateInput<V extends AnyValidate> = InputOf<V>

type ValidateOutput<V extends AnyValidate> = OutputOf<V>

type AnyValidate = Validate<any>

//// Exports ////

export default Validate

export {
    Validate,
    ValidateOptions,
    ValidateInput,
    ValidateOutput,

    AnyValidate,
}