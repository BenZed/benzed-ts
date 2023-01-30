import {
    Schema,
    AbstractValidate,
    AnyValidate,
    NameErrorIdSignature,
    ValidateContext,
    ValidateOptions,
    ValidationError
} from '@benzed/schema'
    
import { GenericObject, isObject, keysOf, OutputOf } from '@benzed/util'

import { MutatorType } from '../../mutator'

import { 
    HasMutator, 
    RemoveMutator } from '../../mutator/mutator-operations'

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

type _RequiredWritableProperties<T extends ShapeInput> = {
    -readonly [K in keyof T as _OnRequiredWritable<T[K], K>]-?: T[K]
}

type _RequiredReadOnlyProperties<T extends ShapeInput> = {
    +readonly [K in keyof T as _OnRequiredReadOnly<T[K], K>]-?: T[K]
}

type _OptionalWritableProperties<T extends ShapeInput> = {
    -readonly [K in keyof T as _OnOptionalWritable<T[K], K>]+?: T[K]
}

type _OptionalReadOnlyProperties<T extends ShapeInput> = {
    +readonly [K in keyof T as _OnOptionalReadOnly<T[K], K>]+?: T[K]
}  

type _ShapeProperties<T extends ShapeInput> = 
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

type ShapeOutput<T extends ShapeInput> = {
    [K in keyof _ShapeProperties<T>]: _ShapePropertyOutput<T[K]>
}

type ShapeInput = {
    [key: string | number | symbol]: AnyValidate
}

//// Helper ////

function shapeValidate<T extends ShapeInput>(
    this: ShapeValidate<T>, 
    input: unknown, 
    options?: Partial<ValidateOptions>
): ShapeOutput<T> {
    const ctx = new ValidateContext(input, options)

    if (!isObject<GenericObject>(input))
        throw new ValidationError(this, ctx)

    const output: GenericObject = {}
    for (const key of keysOf(this.properties)) {
        const property = this.properties[key]
        output[key] = property(input[key], ctx.push(key))
    }

    return output as ShapeOutput<T>
}

class ShapeValidate<T extends ShapeInput> extends AbstractValidate<unknown, ShapeOutput<T>> {

    override error(): string {
        return 'Must be an object'
    }

    constructor(readonly properties: T, ...args: NameErrorIdSignature<unknown>) {
        super(shapeValidate, ...args)
    }

}

//// Tuple ////  

class Shape<T extends ShapeInput> extends Schema<unknown, ShapeOutput<T>> {

    protected override get _mainValidator(): ShapeValidate<T> {
        return this.validators[0] as ShapeValidate<T>
    }

    get properties(): T {
        return this._mainValidator.properties
    }

    constructor(properties: T) {
        super(new ShapeValidate(properties))
    }

}

//// Exports ////

export default Shape

export {
    Shape,
    ShapeInput,
    ShapeOutput
}