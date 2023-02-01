import { assign, isString } from '@benzed/util'
import ValidationContext from './validation-context'

//// Main ////

class ValidationError<T> extends Error implements ValidationContext<T> {

    static is<T>(input: object): input is ValidationError<T> {
        return ValidationContext.is(input)
        && 'message' in input
        && isString(input.message)
        && 'name' in input
        && input.name === ValidationError.name
    } 

    readonly input!: T
    readonly transform!: boolean
    readonly transformed!: T

    constructor(
        message: string,
        ctx: ValidationContext<T>
    ) {
        super(message)
        assign(this, { ...ctx, name: ValidationError.name })
    }

}

//// Exports ////

export default ValidationError

export {
    ValidationError
}