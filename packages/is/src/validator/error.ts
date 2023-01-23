
import { isFunc, nil } from '@benzed/util'
import Validate from './validate'
import { createValidatorContext, ValidatorContext } from './validator'

////  ////

//// Types ////

export class ValidationError<T = unknown> extends Error {

    static throw<I>(
        validator: Validate<I,unknown>,
        error: string | ValidationErrorMessage<I>, 
        ctx: ValidatorContext<I> = createValidatorContext(nil) as ValidatorContext<I>
    ): never {
        throw new ValidationError(ctx, isFunc(error) 
            ? error.call(validator, ctx.transformed ?? ctx.input, ctx) 
            : error
        )
    }

    constructor(
        readonly ctx: ValidatorContext<T>,
        msg: string
    ) {
        super(`${ctx.path.join('\/')} ${msg}`.trim())
    }

}

export type ValidationErrorMessage<T = unknown> = (input: T, ctx: ValidatorContext<T>) => string

