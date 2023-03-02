import { IndexesOf, pick } from '@benzed/util'
import { ValidateInput, ValidateOutput } from '../../../validate'
import { Validator } from '../../validator'

import { Validators, PipeValidator} from '../pipe-validator'

//// EsLint ////
/* eslint-disable 
    @typescript-eslint/no-explicit-any,
*/

//// Helper Types ////

type FirstValidator<T extends Validators> = T extends [infer F, ...any]
    ? F extends Validator
        ? F 
        : never
    : never

type LastValidator<T extends Validators> = T extends [...any, infer L]
    ? L extends Validator
        ? L 
        : T extends [infer F]
            ? F extends Validator
                ? F
                : never
            : never
    : never

//// TYpes ////

type TransformTo<T extends Validators> = Validator<
/**/ ValidateOutput<LastValidator<T>>,
/**/ ValidateOutput<LastValidator<T>>
>

type TransformInput<T extends Validators> = ValidateInput<FirstValidator<T>>
type TransformOutput<T extends Validators> = ValidateOutput<LastValidator<T>> extends TransformInput<T>
    ? ValidateOutput<LastValidator<T>>
    : never

type TransformToAnother<T extends Validators, Tx extends Validator> = 
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

    // get [Validator.state](): Pick<this, 'validators'> {      
    //     return pick(this, 'validators')
    // }

}

//// Exports ////

export default TransformValidator

export {
    TransformValidator,
    TransformInput,
    TransformOutput,
    TransformTo,
}