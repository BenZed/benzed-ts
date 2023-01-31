import ValidationContext from './validation-context'

//// Main ////

class ValidationError<T> extends Error {

    constructor(
        message: string,
        readonly context: ValidationContext<T>
    ) {
        super(message)
    }

}

//// Exports ////

export default ValidationError

export {
    ValidationError
}