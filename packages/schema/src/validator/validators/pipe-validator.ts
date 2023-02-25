
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

    [Validator.analyze](ctx: ValidationContext<I,O>): ValidationContext<I,O> {

        for (const validator of this.validators) {
            ctx = validator[Validator.analyze](ctx as ValidationContext)
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