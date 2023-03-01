
import { Copyable } from '@benzed/immutable'
import { each, GenericObject, Infer, pick } from '@benzed/util'

import { ValidateOutput } from '../../validate'
import ValidationContext from '../../validation-context'

import type {
    ModifierType,
    HasModifier,
    RemoveModifier
} from '../modifier'

import { Validator } from '../validator'

//// EsLint ////

/* eslint-disable
    @typescript-eslint/no-explicit-any,
    @typescript-eslint/ban-types,
*/

//// Helper Types ////

type _HasReadOnly<T extends Validator> = HasModifier<T, ModifierType.ReadOnly>

type _HasOptional<T extends Validator> = HasModifier<T, ModifierType.Optional>

type _OnRequiredWritable<T extends Validator, Y, N = never> = 
    _HasOptional<T> extends false ? _HasReadOnly<T> extends false ? Y : N : N

type _OnRequiredReadOnly<T extends Validator, Y, N = never> = 
    _HasOptional<T> extends false ? _HasReadOnly<T> extends true ? Y : N : N

type _OnOptionalWritable<T extends Validator, Y, N = never> = 
    _HasOptional<T> extends true ? _HasReadOnly<T> extends false ? Y : N : N

type _OnOptionalReadOnly<T extends Validator, Y, N = never> = 
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

type _ShapePropertyOutput<T extends Validator> = 
    ValidateOutput<
    // GOTCHA: We're not actually removing the mutators 
    // in implementation. This is only to clean up the
    // output type
    /**/ RemoveModifier<
    /*    */ RemoveModifier<T, ModifierType.Optional>,
    /**/ ModifierType.ReadOnly>
    >

//// Types ////

type ShapeValidatorOutput<T extends ShapeValidatorInput> = Infer<{
    [K in keyof _ShapeProperties<T>]: _ShapePropertyOutput<T[K]>
}, object>

type ShapeValidatorInput = {
    [key: string | number | symbol]: Validator
}

//// Tuple ////

class ShapeValidator<T extends ShapeValidatorInput> 
    extends Validator<object, ShapeValidatorOutput<T>> {

    constructor(
        readonly properties: T
    ) {
        super()
    }

    [Validator.analyze](ctx: ValidationContext<object, ShapeValidatorOutput<T>>) {

        const output = ctx.transformed = Copyable.createFromProto(ctx.input) as GenericObject

        for (const [key, property] of each.entryOf(this.properties)) {

            const value = ctx.input[key as keyof typeof ctx.input] as any
            let propertyCtx = ctx.pushSubContext(value, key)

            propertyCtx = property[Validator.analyze](propertyCtx)
            if (propertyCtx.hasValidOutput())
                output[key] = propertyCtx.getOutput()
        }

        const invalidKeys = ctx.transform 
            ? []
            : each.keyOf(ctx.input).filter(k => !(k in this.properties))

        return invalidKeys.length > 0
            ? ctx.setError(`contains invalid keys: ${invalidKeys.map(String)}`)
            : ctx.setOutput(output as ShapeValidatorOutput<T>)
    }

    get [Validator.state](): Pick<this, 'properties'> {
        return pick(this, 'properties')
    }

}

//// Exports ////

export default ShapeValidator

export {
    ShapeValidator,
    ShapeValidatorInput,
    ShapeValidatorOutput
}