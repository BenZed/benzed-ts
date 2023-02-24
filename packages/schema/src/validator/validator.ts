
import { Validate, ValidateOptions } from '../validate'
import ValidationContext from '../validation-context'
import ValidationError from '../validation-error'

import { Asserter, Detailer, Transformer } from './traits'

//// EsLint ////
/* eslint-disable 
    @typescript-eslint/no-explicit-any,
*/

//// Main ////

/**
 * Validator is a versatile validate implemention that uses Validator
 * traits when analyzing a validation.
 */
class Validator<I = any, O extends I = I> extends Validate<I,O> {

    [Validate.analyze](input: I, options?: ValidateOptions): ValidationContext<I,O> {

        const ctx = new ValidationContext<I,O>(input, options)

        const output = Transformer.transform(this, ctx)

        ctx.result = Asserter.isValid(this, ctx, output)
            ? { output }
            : {
                error: new ValidationError({
                    key: ctx.key,
                    value: ctx.input,
                    detail: Detailer.resolve(this, ctx)
                })
            }

        return ctx
    }

}

//// Exports ////

export default Validator 

export {
    Validator
}