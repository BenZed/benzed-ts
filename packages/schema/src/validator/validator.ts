
import { nil } from '@benzed/util'
import { Validate, ValidateOptions } from '../validate'
import ValidationContext from '../validation-context'
import ValidationError from '../validation-error'

import { Assert, Cast, Default, Detail, Transform } from './traits'

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

        // Apply trait transformations
        if (this instanceof Default && ctx.transformed === nil)
            ctx.transformed = this.default(ctx)

        if (this instanceof Cast && !Assert.isValid(this, ctx, ctx.transformed))
            ctx.transformed = this.cast(ctx.transformed, ctx)

        if (this instanceof Transform) 
            ctx.transformed = this.transform(ctx.transformed, ctx)

        // Determine output
        const output = ctx.transform ? ctx.transformed : ctx.input

        // Apply result
        ctx.result = Assert.isValid(this, ctx, output)
            ? { output }
            : {
                error: new ValidationError({
                    key: ctx.key,
                    value: ctx.input,
                    detail: Detail.resolve(this, ctx)
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