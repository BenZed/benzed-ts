
import { isFunc } from '@benzed/util'
import { ValidatorContext } from './validator'

//// Types ////

export class ValidationError<T = unknown> extends Error {

    static throw<I>(ctx: ValidatorContext<I>, error: string | ValidationErrorMessage<I>): never {
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

