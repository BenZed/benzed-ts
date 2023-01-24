import { isString } from '@benzed/util'
import ValidateContext from './validate-context'

//// Types ////

export class ValidationError<T = unknown> extends Error {

    constructor(
        error: ValidationErrorInput<T> | { error: ValidationErrorInput<T> },
        ctx: ValidateContext<T>
    ) {

        // untangle error message
        const msg = isString(error)
            ? error
            : 'error' in error 
                ? isString(error.error)
                    ? error.error 
                    : error.error(ctx.input, ctx)
                : error(ctx.input, ctx)

        super(`${ctx.path.join('\/')} ${msg}`.trim())
    }

}

export type ValidationErrorMessage<T = unknown> = (input: T, ctx: ValidateContext<T>) => string

export type ValidationErrorInput<T> = string | ValidationErrorMessage<T> 