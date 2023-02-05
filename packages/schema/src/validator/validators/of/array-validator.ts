import { isArray, OutputOf } from '@benzed/util'

import { ValidateOptions } from '../../../validate'
import { ValidationError } from '../../../validation-error'
import { AnyValidatorStruct } from '../../validator-struct'
import { ValidationContext } from '../../../validation-context'
import OfValidator from '../of-validator'

//// Main ////

class ArrayValidator<V extends AnyValidatorStruct> extends OfValidator<V, OutputOf<V>[]> {

    validate(input: unknown, options?: ValidateOptions): OutputOf<V>[] {
        
        const ctx = new ValidationContext(input, options)

        if (!isArray(input))
            throw new ValidationError(this.message(ctx), ctx)
        
        return this.of(input, options)
    }

    override message(ctx: ValidationContext<unknown>): string {
        void ctx
        return `Must be an array of ${this.of.name}`
    }

}

//// Exports ////

export default ArrayValidator

export {
    ArrayValidator
}