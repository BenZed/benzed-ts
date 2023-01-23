import { asNil, isNil as _isNil, nil } from '@benzed/util'
import { ValidationError, ValidationErrorMessage } from '../../../../schema/src/validator/error'
import Validate, { ValidateOptions } from '../../../../schema/src/validator/validate'

/* eslint-disable 
    @typescript-eslint/no-explicit-any
*/

//// Helper ////

function isAsNil(this: Nil, input: unknown, options?: ValidateOptions): nil {

    if (options?.transform)
        input = asNil(input)

    if (!_isNil(input))
        ValidationError.throw(this, this.error)

    return nil
}

//// Setup ////

class Nil extends Validate<unknown, nil> {
    constructor(readonly error: string | ValidationErrorMessage<unknown> = 'Must be nil') {
        super(isAsNil)
    }
}

//// Exports ////

export default Nil

export {
    Nil
}

export const isNil = new Nil()