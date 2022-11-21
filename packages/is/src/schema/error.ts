import { returns } from '@benzed/util'
import { ValidateContext } from './context'

//// Types ////

export class ValidationError extends Error {

    override name = 'ValidationError'

    constructor(
        msg: string, 
        readonly ctx: ValidateContext
    ) {
        super(`${ctx.path} ${msg}`.trim())
    }

}

export type ErrorMessage<V = unknown> = ((value: Readonly<V>) => string)

export const toErrorMessage = (i: string | ErrorMessage): ErrorMessage => 
    typeof i === 'string' ? returns(i) : i
