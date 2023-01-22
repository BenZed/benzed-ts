
import { isFunc, nil } from '@benzed/util'
import { createValidatorContext, ValidatorContext } from './validator'

////  ////

//// Types ////

export class ValidationError<T = unknown> extends Error {

    static throw<I>(
        error: string | ValidationErrorMessage<I>, 
        ctx: ValidatorContext<I> = createValidatorContext(nil) as ValidatorContext<I>
    ): never {
        throw new ValidationError(ctx, isFunc(error) 
            ? error(ctx.transformed ?? ctx.input, ctx) 
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

export type ValidationErrorMessage<T = unknown> = (output: T, ctx: ValidatorContext<T>) => string

