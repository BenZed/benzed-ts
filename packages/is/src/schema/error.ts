import { ValidateContext } from './context'

//// Types ////

export class ValidationError<V = unknown> extends Error {

    override name = 'ValidationError'

    constructor(
        readonly value: V,
        readonly ctx: ValidateContext,
        msg: string | ErrorMessage<V> = 'Validation failed.'  
    ) {

        const error = typeof msg === 'function' ? msg(value, ctx) : msg

        super(`${ctx.path.join('\/')} ${error}`.trim())
    }

}

export type ErrorMessage<V = unknown> = 
    (value: Readonly<V>, ctx: ValidateContext) => string

