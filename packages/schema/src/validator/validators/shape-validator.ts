
import { GenericObject, Infer, isObject, keysOf, nil, OutputOf, pick } from '@benzed/util'

import { ValidateOptions } from '../../validate'
import ValidationContext from '../../validation-context'
import ValidationError from '../../validation-error'

import {
    MutatorType,
    HasMutator,
    RemoveMutator
} from '../mutator'

import { AnyValidateStruct } from '../validate-struct'

import { ValidatorStruct } from '../validator-struct'

//// EsLint ////

/* eslint-disable
    @typescript-eslint/no-explicit-any,
    @typescript-eslint/ban-types,
*/

//// Helper Types ////

type _HasReadOnly<T extends AnyValidateStruct> = HasMutator<T, MutatorType.ReadOnly>

type _HasOptional<T extends AnyValidateStruct> = HasMutator<T, MutatorType.Optional>

type _OnRequiredWritable<T extends AnyValidateStruct, Y, N = never> = 
    _HasOptional<T> extends false ? _HasReadOnly<T> extends false ? Y : N : N

type _OnRequiredReadOnly<T extends AnyValidateStruct, Y, N = never> = 
    _HasOptional<T> extends false ? _HasReadOnly<T> extends true ? Y : N : N

type _OnOptionalWritable<T extends AnyValidateStruct, Y, N = never> = 
    _HasOptional<T> extends true ? _HasReadOnly<T> extends false ? Y : N : N

type _OnOptionalReadOnly<T extends AnyValidateStruct, Y, N = never> = 
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
    & _RequiredWritableProperties<T>
    & _RequiredReadOnlyProperties<T>
    & _OptionalWritableProperties<T>
    & _OptionalReadOnlyProperties<T>

type _ShapePropertyOutput<T extends AnyValidateStruct> = 
    OutputOf<
    // GOTCHA: We're not actually removing the mutators 
    // in implementation. This is only to clean up the
    // output type
    /**/ RemoveMutator<
    /*    */ RemoveMutator<T, MutatorType.Optional>,
    /**/ MutatorType.ReadOnly>
    >

//// Types ////

type ShapeValidatorOutput<T extends ShapeValidatorInput> = Infer<{
    [K in keyof _ShapeProperties<T>]: _ShapePropertyOutput<T[K]>
}, object>

type ShapeValidatorInput = {
    [key: string | number | symbol]: AnyValidateStruct
}

//// Tuple ////

class ShapeValidator<T extends ShapeValidatorInput> 
    extends ValidatorStruct<unknown, ShapeValidatorOutput<T>> {

    constructor(
        readonly properties: T, 
        override readonly name = 'Shape'
    ) {
        super()
    }

    message(): string {

        const name = this.name === 'Shape' 
            ? this.name 
            : ''

        return [
            'Must adhere to',
            name,
            'shape'
        ].join(' ')
    }

    default(ctx: ValidationContext<unknown>): unknown {
        void ctx
        return nil
    }

    validate(input: unknown, options?: ValidateOptions): ShapeValidatorOutput<T> {

        const ctx = new ValidationContext(input, options)

        // Default Empty Object *1
        const inputObject = input === nil
            ? this.default(ctx)
            : input

        // Check is Object *2
        if (!isObject<GenericObject>(inputObject))
            throw new ValidationError(this, ctx)

        // TODO: *1 & *2 are essentially doing the same
        // thing as a TypeValidator. PipeSchema should
        // put these two together.

        const transformed = Object.create(inputObject.constructor.prototype)

        for (const key of keysOf(this.properties)) {
            const $property = this.properties[key]
            const value = inputObject[key]
            transformed[key] = $property(value, ctx)
        }

        ctx.transformed = transformed

        const output = ctx.transform 
            ? ctx.transformed 
            : inputObject

        if (!ValidatorStruct.equal(output, ctx.transformed))
            throw new ValidationError(this, ctx)

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