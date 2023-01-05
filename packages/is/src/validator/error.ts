
import { isFunc } from '@benzed/util/src'
import { ValidatorContext } from './validator'

//// Types ////

export class ValidationError<T = unknown> extends Error {

    static throw<I>(ctx: ValidatorContext<I>, error: string | ValidationErrorMessage<I>): never {
        throw new ValidationError(ctx, isFunc(error) ? error(ctx) : error)
    }

    constructor(
        readonly ctx: ValidatorContext<T>,
        msg: string
    ) {
        super(`${ctx.path.join('\/')} ${msg}`.trim())
    }

}

export type ValidationErrorMessage<T = unknown> = (ctx: ValidatorContext<T>) => string

