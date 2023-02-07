import { indexesOf, isArray, OutputOf } from '@benzed/util'

import { ValidateOptions } from '../../../validate'
import { ValidationError } from '../../../validation-error'
import { AnyValidateStruct } from '../../validate-struct'
import { ValidationContext } from '../../../validation-context'

import OfValidator from '../of-validator'

//// Main ////

class ArrayValidator<V extends AnyValidateStruct> extends OfValidator<V, OutputOf<V>[]> {

    validate(input: unknown, options?: ValidateOptions): OutputOf<V>[] {
        
        const ctx = new ValidationContext(input, options)

        if (!isArray(input))
            throw new ValidationError(this, ctx)

        try {
            const output = ctx.transformed = [ ...input ]

            for (const index of indexesOf(output)) 
                output[index] = this.of(output[index], ctx)

            return output as OutputOf<V>[]

        } catch (e) {
            if (!(e instanceof ValidationError))
                throw e
            throw new ValidationError(e.message, ctx)
        }
    }

}

//// Exports ////

export default ArrayValidator

export {
    ArrayValidator
}