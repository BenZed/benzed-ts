import { IndexesOf } from '@benzed/util'
import { Validate, ValidateInput, ValidateOutput } from '../validate'

import {Validators, PipeValidator} from './pipe-validator'
import ContractValidator from './contract-validator'

//// EsLint ////
/* eslint-disable 
    @typescript-eslint/no-explicit-any,
*/

//// Helper Types ////

type FirstValidator<T extends Validators> = T extends [infer F, ...any]
    ? F extends ContractValidator
        ? F 
        : never
    : never

type LastValidator<T extends Validators> = T extends [...any, infer L]
    ? L extends ContractValidator
        ? L 
        : T extends [infer F]
            ? F extends ContractValidator
                ? F
                : never
            : never
    : never

//// TYpes ////

type TransformTo<T extends Validators> = Validate<
/**/ ValidateOutput<LastValidator<T>>,
/**/ ValidateOutput<LastValidator<T>>
>

type TransformInput<T extends Validators> = ValidateInput<FirstValidator<T>>
type TransformOutput<T extends Validators> = ValidateOutput<LastValidator<T>> extends TransformInput<T>
    ? ValidateOutput<LastValidator<T>>
    : never

type TransformToAnother<T extends Validators, Tx extends Validate> = 
    [...T, Tx] extends Validators 
        ? TransformValidator<[...T, Tx]>
        : never

//// Main ////

class TransformValidator<T extends Validators>

    extends PipeValidator<TransformInput<T>, TransformOutput<T>>{

    readonly validators: T

    constructor(...transformers: T) {
        super()
        this.validators = transformers
    }

    at<I extends IndexesOf<T>>(index: I): T[I] {
        const validator = this.validators.at(index)
        if (!validator)
            throw new Error(`No transformer at ${index}`)

        return validator as T[I]
    }

    to<Tx extends TransformTo<T>>(validator: Tx): TransformToAnother<T, Tx> {
        return new TransformValidator(
            ...this.validators as Validators,
            validator
        ) as unknown as TransformToAnother<T, Tx>
    }

}

//// Exports ////

export default TransformValidator

export {
    TransformValidator,
    TransformInput,
    TransformOutput,
    TransformTo,

    LastValidator,
    FirstValidator
}