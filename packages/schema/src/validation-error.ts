import { Struct } from '@benzed/immutable'
import {
    assign,
    isFunc,
    isEqual,
    isShape,
    isString,
    isUnion,
    isIntersection,
    AnyTypeGuard,
    Property,
    Func
} from '@benzed/util'

import ValidationContext from './validation-context'

import type { 
    AnyValidateStruct,
    AnyValidatorStruct,
} from './validator'

//// Types ////

type ValidationErrorMessage<T> = (ctx: ValidationContext<T>) => string

/**
 * Implements a ValidationErrorMessage<T>
 */
interface ValidateWithErrorMessage<T> {
    readonly message: string | ValidationErrorMessage<T>
}

type ResolveErrorMessageParams<T> =     
    string | ValidateWithErrorMessage<T> | ValidationErrorMessage<T> | AnyValidateStruct

//// Helper ////

const isFuncNotStruct = (i: AnyValidatorStruct | Func): i is Func => 
    !Struct.is(i) && isFunc(i)

const isErrorMessage: <T>(i: unknown) => i is string | ValidationErrorMessage<T> = 
    isUnion(
        isFuncNotStruct,
        isString
    )

const hasErrorMessage: <T>(i: unknown) => i is ValidateWithErrorMessage<T> = 
    isShape({
        message: isErrorMessage
    })

function resolveErrorMessage<T>(

    input: ResolveErrorMessageParams<T>,
    ctx: ValidationContext<T>,
    defaultErrorMessage: string | ValidationErrorMessage<T> = 'Validation failed.'

): string {

    const container = hasErrorMessage(input) 
        ? input 
        : { message: isErrorMessage(input) ? input : defaultErrorMessage }

    return isFunc(container.message) 
        ? container.message(ctx) 
        : container.message
}

//// Main ////

class ValidationError<T> extends Error implements ValidationContext<T> {

    static is: <T>(i: unknown) => i is ValidationError<T> = isIntersection(
        ValidationContext.is as AnyTypeGuard,
        isShape({
            message: isString,
            name: isEqual(ValidationError.name)
        })
    )

    static resolveMessage = resolveErrorMessage

    readonly input!: T
    readonly transform!: boolean
    readonly transformed!: T

    constructor(
        message: ResolveErrorMessageParams<T>,
        ctx: ValidationContext<T>
    ) {
        super(resolveErrorMessage(message, ctx))
        assign(this, { ...ctx, name: ValidationError.name })
    }

}

//// Exports ////

const isValidationError = Property.name(ValidationError.is, `is${ValidationError.name}`)

export default ValidationError

export {
    ValidationError,
    isValidationError,

    ValidationErrorMessage,

    ValidateWithErrorMessage,
    hasErrorMessage,
    resolveErrorMessage
}