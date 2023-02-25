
import { ValidateOptions } from '../../validate'
import ValidationContext from '../../validation-context'
import { Validator } from '../validator'

//// EsLint ////
/* eslint-disable 
    @typescript-eslint/no-explicit-any,
*/

//// Types ////

type Validators<I = any, O extends I = I> = readonly [
    input: Validator<I,O>, 
    ...output: Validator<O, O>[]
]

//// Main ////

/**
 * Combine an input validator with many output validators.
 */
abstract class PipeValidator<I, O extends I = I> extends Validator<I, O> {

    [Validator.analyze](input: I, options?: ValidateOptions): ValidationContext<I,O> {
        let ctx = new ValidationContext<I,O>(input, options)

        for (const validator of this.validators) {

            ctx = validator[Validator.analyze](ctx.transformed as O, ctx)
            if (ctx.result && 'error' in ctx.result)
                return ctx
        }

        return ctx
    }

    *[Symbol.iterator](): IterableIterator<Validators<I,O>[number]> {
        yield* this.validators
    }

    abstract get validators(): Validators<I,O>

}

//// Exports ////

export default PipeValidator

export {
    PipeValidator,
    Validators
}