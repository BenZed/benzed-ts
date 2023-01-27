import Validator, { ValidatorSettings } from '../validator/validator'

//// Types ////

interface SubValidatorSettings<T> extends Pick<ValidatorSettings<T,T>, 'error' | 'name' | 'id'> {}

//// Main ////

class SubValidator<T> extends Validator<T,T> {
    constructor(settings?: SubValidatorSettings<T>) {
        super({...settings})
    }
}

//// Exports ////

export default SubValidator

export {
    SubValidator,
    SubValidatorSettings
}