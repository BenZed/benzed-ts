
import { isFunc, nil } from '@benzed/util'
import Validate from './validate'
import { createValidatorContext, ValidatorContext } from './validator'

//// Types ////

type ValidationErrorInput<T> = string | ValidationErrorMessage<T> 

export class ValidationError<T = unknown> extends Error {

    constructor(
        msg: ValidationErrorInput<T> | { error: ValidationErrorInput<T> },
        ctx: T | ValidatorContext<T>
    ) {

        if (ctx instanceof ValidatorContext)

            super(`${ctx.path.join('\/')} ${msg}`.trim())
    }

}

export type ValidationErrorMessage<T = unknown> = (input: T, ctx: ValidatorContext<T>) => string

