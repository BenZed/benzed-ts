
import { ValidateContext } from './context'

//// Types ////

export class ValidationError<V = unknown> extends Error {

    override name = 'ValidationError'

    constructor(
        readonly value: V,
        readonly ctx: ValidateContext<V>,
        msg: string
    ) {

        super(`${ctx.path.join('\/')} ${msg}`.trim())
    }

}

export type ErrorMessage<V = unknown> = (value: V, ctx: ValidateContext<V>) => string

