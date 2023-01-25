import { CallableStruct } from '@benzed/immutable'
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

//// Exports ////

export default Validate

export {
    Validate,
    ValidateOptions,
    ValidateInput,
    ValidateOutput,

    AnyValidate
}