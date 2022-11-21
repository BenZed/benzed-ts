import { returns } from '@benzed/util'
import { ValidateContext } from './context'

//// Types ////

export class ValidationError extends Error {

    constructor(
        msg: string, 
        readonly ctx: ValidateContext
    ) {
        super(`${ctx.path} ${msg}`.trim())
    }

}

export type ErrorMessage<V = unknown> = ((value: Readonly<V>) => string)

export const toErrorMessage = (i: string | ErrorMessage = 'Validation failed.'): ErrorMessage => 
    typeof i === 'string' ? returns(i) : i
