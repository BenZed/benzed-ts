import { isFunc, isString } from '@benzed/util'
import ValidateContext from './validate-context'

//// Types ////

export class ValidationError<T = unknown> extends Error {

    constructor(
        eCtx: { error?: ValidationErrorInput<T> },
        readonly vCtx: ValidateContext<T>
    ) {

        const msg = isFunc(eCtx.error)
            ? eCtx.error(vCtx.input, vCtx)
            : eCtx.error ?? 'Validation failed.'   

        super(`${vCtx.path.join('\/')} ${msg}`.trim())
    }

}

export type ValidationErrorMessage<T = unknown> = (input: T, ctx: ValidateContext<T>) => string

export type ValidationErrorInput<T> = string | ValidationErrorMessage<T> 

export const isValidationErrorInput = 
    <T>(input: unknown): input is ValidationErrorInput<T> => 
        isString(input) || isFunc(input)
