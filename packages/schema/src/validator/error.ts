import ValidateContext from './context'

//// Types ////

type ValidationErrorInput<T> = string | ValidationErrorMessage<T> 

export class ValidationError<T = unknown> extends Error {

    constructor(
        msg: ValidationErrorInput<T> | { error: ValidationErrorInput<T> },
        ctx: T | ValidateContext<T>
    ) {

        if (!(ctx instanceof ValidateContext))
            ctx = new ValidateContext(ctx)

        super(`${ctx.path.join('\/')} ${msg}`.trim())
    }

}

export type ValidationErrorMessage<T = unknown> = (input: T, ctx: ValidateContext<T>) => string

