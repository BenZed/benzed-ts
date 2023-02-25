
import { equals } from '@benzed/immutable'
import { isFunc } from '@benzed/util'

import { Validator } from '../validator'
import { ValidateOptions } from '../../validate'
import ValidationContext from '../../validation-context'
import ValidationError from '../../validation-error'

//// EsLint ////

/* eslint-disable
    @typescript-eslint/no-explicit-any,
*/

//// Main ////

abstract class ContractValidator<I = any, O extends I = I> extends Validator<I,O> {

    isValid(input: I | O, ctx: ValidationContext<I,O>): boolean {
        return equals(input, ctx.transformed)
    }

    transform?(input: I, ctx: ValidationContext<I,O>): I | O

    readonly message?: string | ((input: I, ctx: ValidationContext<I,O>) => string)

    //// Analyze ////

    [Validator.analyze](input: I, options?: ValidateOptions): ValidationContext<I,O> {

        const ctx = new ValidationContext<I,O>(input, options)

        if (this.transform)
            ctx.transformed = this.transform(input, ctx)

        // Determine output
        const output = ctx.transform 
            ? ctx.transformed 
            : ctx.input

        // Apply result
        ctx.result = this.isValid(output, ctx)
            ? { output } as { output: O }
            : {
                error: new ValidationError({
                    key: ctx.key,
                    value: ctx.input,
                    detail: isFunc(this.message) 
                        ? this.message(output, ctx) 
                        : this.message ?? 'Validation failed.' 
                })
            }

        return ctx
    }

}

//// Exports ////

export default ContractValidator 

export {
    ContractValidator
}