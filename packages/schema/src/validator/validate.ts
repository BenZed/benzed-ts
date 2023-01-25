import { CallableStruct, Struct } from '@benzed/immutable'
import { Infer, InputOf, OutputOf } from '@benzed/util'

import { ValidateOptions } from './validate-options'

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

//// Constructor ////

interface ValidateConstructor extends Infer<typeof CallableStruct> {
    new <I,O>(validate: Validate<I,O>): Struct & Validate<I,O>
}

const Validate = class <I,O>extends CallableStruct<Validate<I,O>> {} as ValidateConstructor

//// Exports ////

export default Validate

export {
    Validate,
    ValidateOptions,
    ValidateInput,
    ValidateOutput,

    ValidateConstructor,
    AnyValidate,
}