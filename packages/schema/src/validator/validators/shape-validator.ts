
import { GenericObject, keysOf, OutputOf } from '@benzed/util'
import { AnyValidate, ValidateOptions } from '../../validate'
import ValidationContext from '../../validation-context'
import ValidationError from '../../validation-error'

import {
    MutatorType,
    HasMutator,
    RemoveMutator
} from '../mutator'

import { ValidatorStruct } from '../validator-struct'

//// EsLint ////

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
    @typescript-eslint/ban-types,
*/

//// Helper Types ////

type _HasReadOnly<T extends AnyValidate> = HasMutator<T, MutatorType.ReadOnly>

type _HasOptional<T extends AnyValidate> = HasMutator<T, MutatorType.Optional>

type _OnRequiredWritable<T extends AnyValidate, Y, N = never> = 
    _HasOptional<T> extends false ? _HasReadOnly<T> extends false ? Y : N : N

type _OnRequiredReadOnly<T extends AnyValidate, Y, N = never> = 
    _HasOptional<T> extends false ? _HasReadOnly<T> extends true ? Y : N : N

type _OnOptionalWritable<T extends AnyValidate, Y, N = never> = 
    _HasOptional<T> extends true ? _HasReadOnly<T> extends false ? Y : N : N

type _OnOptionalReadOnly<T extends AnyValidate, Y, N = never> = 
    _HasOptional<T> extends true ? _HasReadOnly<T> extends true ? Y : N : N

type _RequiredWritableProperties<T extends ShapeValidatorInput> = {
    -readonly [K in keyof T as _OnRequiredWritable<T[K], K>]-?: T[K]
}

type _RequiredReadOnlyProperties<T extends ShapeValidatorInput> = {
    +readonly [K in keyof T as _OnRequiredReadOnly<T[K], K>]-?: T[K]
}

type _OptionalWritableProperties<T extends ShapeValidatorInput> = {
    -readonly [K in keyof T as _OnOptionalWritable<T[K], K>]+?: T[K]
}

type _OptionalReadOnlyProperties<T extends ShapeValidatorInput> = {
    +readonly [K in keyof T as _OnOptionalReadOnly<T[K], K>]+?: T[K]
}  

type _ShapeProperties<T extends ShapeValidatorInput> = 
    _RequiredWritableProperties<T> &
    _RequiredReadOnlyProperties<T> &
    _OptionalWritableProperties<T> &
    _OptionalReadOnlyProperties<T>

type _ShapePropertyOutput<T extends AnyValidate> = 
    OutputOf<
    // GOTCHA: We're not actually removing the mutators 
    // in implementation. This is only to clean up the
    // output type
    /**/ RemoveMutator<
    /*    */ RemoveMutator<T, MutatorType.Optional>,
    /**/ MutatorType.ReadOnly>
    >

//// Types //// 

type ShapeValidatorOutput<T extends ShapeValidatorInput> = {
    [K in keyof _ShapeProperties<T>]: _ShapePropertyOutput<T[K]>
}

type ShapeValidatorInput = {
    [key: string | number | symbol]: AnyValidate
}

//// Tuple ////  

class ShapeValidator<T extends ShapeValidatorInput> extends ValidatorStruct<object, ShapeValidatorOutput<T>> {

    constructor(readonly properties: T) {
        super()
    }

    // readonly strict = true // <- only defined properties
    // pick() // <- create a new shape validator with a subset of properties
    // omit() // <- create a new shape validator with an exclusive subset of properties
    // merge() // <- create a new shape validator with additional properties 

    validate(input: object, options?: ValidateOptions): ShapeValidatorOutput<T> {

        const ctx = new ValidationContext(input, options)
        const output = {} as GenericObject

        for (const key of keysOf(this.properties)) {
            const validateProperty = this.properties[key]
            const value = (input as GenericObject)[key]

            output[key] = validateProperty(value, ctx)
        }

        ctx.transformed = output
        if (!ctx.transformed && !this.equal(input, output))
            throw new ValidationError(this.message(ctx), ctx)

        return output as ShapeValidatorOutput<T>
    }

}

//// Exports ////

export default ShapeValidator

export {
    ShapeValidator,
    ShapeValidatorInput,
    ShapeValidatorOutput
}