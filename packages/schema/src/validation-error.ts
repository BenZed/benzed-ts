import { assign } from '@benzed/util'
import ValidationContext from './validation-context'

//// Main ////

class ValidationError<T> extends Error implements ValidationContext<T> {

    readonly input!: T
    readonly transform!: boolean
    readonly transformed!: T

    constructor(
        message: string,
        ctx: ValidationContext<T>
    ) {
        super(message)
        assign(this, ctx)
    }

}

//// Exports ////

export default ValidationError

export {
    ValidationError
}