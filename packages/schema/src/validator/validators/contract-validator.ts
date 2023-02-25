
import { equals } from '@benzed/immutable'
import { isFunc } from '@benzed/util'

import { Validator } from '../validator'
import ValidationContext from '../../validation-context'

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

    [Validator.analyze](ctx: ValidationContext<I,O>): ValidationContext<I,O> {

        if (this.transform)
            ctx.transformed = this.transform(ctx.input, ctx)

        // Determine output
        const output = ctx.transform 
            ? ctx.transformed 
            : ctx.input

        // Apply result
        return this.isValid(output, ctx)
            ? ctx.setOutput(output as O)
            : ctx.setError(
                isFunc(this.message) 
                    ? this.message(output, ctx)
                    : this.message ?? 'validation failed'
            )
    }

}

//// Exports ////

export default ContractValidator 

export {
    ContractValidator
}