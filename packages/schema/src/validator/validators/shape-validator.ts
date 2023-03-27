
import { each, GenericObject, Infer, isObject, nil, pick } from '@benzed/util'

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
    ValidateOutput<T>

//// Types ////

type ShapeValidatorOutput<T extends ShapeValidatorInput> = Infer<{
    [K in keyof _ShapeProperties<T>]: _ShapePropertyOutput<T[K]>
}, object>

type ShapeValidatorInput = {
    [key: string | number | symbol]: Validator
}

//// Tuple ////

class ShapeValidator<T extends ShapeValidatorInput> 
    extends Validator<unknown, ShapeValidatorOutput<T>> {

    constructor(
        readonly properties: T,
        readonly strict = true
    ) {
        super()
    }

    override get name(): string {
        return 'Object'
    }

    message(input: unknown, ctx: ValidationContext<unknown, ShapeValidatorOutput<T>>): string {
        void input
        void ctx
        return `must be ${this.name}`
    }

    default?(ctx: ValidationContext<unknown, ShapeValidatorOutput<T>>): ShapeValidatorOutput<T>

    [Validator.analyze](ctx: ValidationContext<unknown, ShapeValidatorOutput<T>>) {

        // Get Source Object
        const source = ctx.input === nil && this.default 
            ? this.default(ctx)
            : isObject(ctx.input) 
                ? ctx.input
                : nil

        if (!isObject<GenericObject>(source)) {
            return ctx.setError(
                this.message(ctx.input, ctx)
            )
        }

        // Get Transformation
        const transformed: GenericObject = ctx.transformed = { }

        // Validate Extra Properties
        const extraKeys = each.keyOf(source).filter(k => !(k in this.properties))
        if (extraKeys.length > 0 && this.strict && !ctx.transform)
            return ctx.setError(`${this.name} contains invalid keys: ${extraKeys.map(String)}`)
        
        else if (!this.strict) {
            for (const extraKey of extraKeys)
                transformed[extraKey] = source[extraKey]
        }

        // Validate Defined Properties
        for (const [key, property] of each.entryOf(this.properties)) {

            const value = source[key as keyof typeof source] as any

            const propertyCtx = property[Validator.analyze](ctx.pushSubContext(value, key))
            if (propertyCtx.hasValidOutput())
                transformed[key] = propertyCtx.getOutput()
        }

        // Validate Keys
        return ctx.hasSubContextError() 
            ? ctx
            : ctx.setOutput(transformed as ShapeValidatorOutput<T>)
    }

    get [Validator.state](): Pick<this, 'properties' | 'name' | 'message' | 'strict'> {
        return pick(this, 'properties', 'name', 'message', 'strict')
    }

}

//// Exports ////

export default ShapeValidator

export {
    ShapeValidator,
    ShapeValidatorInput,
    ShapeValidatorOutput
}