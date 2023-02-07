import { indexesOf, isArray, OutputOf } from '@benzed/util'

import { ValidateOptions } from '../../../validate'
import { ValidationError } from '../../../validation-error'
import { AnyValidateStruct } from '../../validate-struct'
import { ValidationContext } from '../../../validation-context'

import OfValidator from '../of-validator' 

//// HelperTypes ////

type _ArrayValidatorWrapBuilderOutput<V extends AnyValidateStruct, P> = 
    P extends V
        ? ArrayValidator<V>
        : P extends (...args: infer A) => V 
            ? (...args: A) => ArrayValidator<V> 
            : P

type _ArrayValidatorProperties<V extends AnyValidateStruct> = {
    [K in keyof V]: _ArrayValidatorWrapBuilderOutput<V, V[K]>
}

//// Types ////

type ArrayValidator<V extends AnyValidateStruct> = 
    OfValidator<V, OutputOf<V>[]> 
    & _ArrayValidatorProperties<V>

interface ArrayValidatorConstructor {
    new <V extends AnyValidateStruct>(validator: V): ArrayValidator<V>
}

//// Main ////

const ArrayValidator = class <V extends AnyValidateStruct> extends OfValidator<V, OutputOf<V>[]> {

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

} as unknown as ArrayValidatorConstructor

//// Exports ////

export default ArrayValidator

export {
    ArrayValidator
}