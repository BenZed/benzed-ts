import { SubValidatorSettings } from './sub-validator'
import { Validator, ValidatorSettings } from '../validator'

//// Main ////

abstract class ValueValidator<T, O extends ValidatorSettings<T,T> = SubValidatorSettings<T>> extends Validator<T,T> {
    constructor(readonly value: T, options: O) {
        super(options)
    }
}

//// Exports ////

export default ValueValidator

export {
    ValueValidator
}