import { each, OutputOf } from '@benzed/util'

import { ValidateOptions } from '../../../validate'
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

    validate(input: unknown[], options?: ValidateOptions): OutputOf<V>[] {

        const ctx = new ValidationContext(input, options)

        const output = ctx.transformed = [ ...input ]

        for (const index of each.indexOf(output)) 
            output[index] = this.of(output[index], ctx)

        return output as OutputOf<V>[]

    }

} as unknown as ArrayValidatorConstructor

//// Exports ////

export default ArrayValidator

export {
    ArrayValidator
}