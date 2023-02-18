
import { OutputOf, nil, GenericObject, each } from '@benzed/util'

import { ValidateOptions } from '../../../validate'
import { ValidationContext } from '../../../validation-context'
import { ValidationError } from '../../../validation-error'
import { ValidatorStruct } from '../../validator-struct'
import { AnyValidateStruct } from '../../validate-struct'

import OfValidator from '../of-validator'

//// Symbol ////

const $$key = Symbol('key-validator')

//// Helper Types ////

type Key = symbol | string | number 

type _RecordValidatorWrapBuilderOutput<K extends Key, V extends AnyValidateStruct, P> = 
    P extends V
        ? RecordValidator<K, V>
        : P extends (...args: infer A) => V 
            ? (...args: A) => RecordValidator<K, V> 
            : P

type _RecordValidatorProperties<K extends Key, V extends AnyValidateStruct> = {
    [Vk in keyof V]: _RecordValidatorWrapBuilderOutput<K, V, V[Vk]>
} & {
    readonly [$$key]?: KeyValidator<K>
}

//// Types ////

type KeyValidator<K extends Key> = ValidatorStruct<Key, K>

type RecordValidator<K extends Key, V extends AnyValidateStruct> = 
    OfValidator<V, RecordValidatorOutput<K, V>> 
    & _RecordValidatorProperties<K, V>

type RecordValidatorOutput<K extends Key, V extends AnyValidateStruct> =
    Record<K, OutputOf<V>>

interface RecordValidatorConstructor {
    new <V extends AnyValidateStruct>(of: V): RecordValidator<Key, V>
    new <K extends Key, V extends AnyValidateStruct>(key: KeyValidator<K>, of: V): RecordValidator<Key, V>
}

//// Main ////

const RecordValidator = class RecordValidator<
    K extends symbol | string | number,
    V extends AnyValidateStruct,
>
    extends OfValidator<V, RecordValidatorOutput<K, V>> {

    protected readonly [$$key]?: KeyValidator<K>

    //// Construct ////
    
    constructor(value: V)
    constructor(key: KeyValidator<K>, target: V)
    constructor(...args: [KeyValidator<K>, V] | [V]) {

        const target = args.length === 2 
            ? args[1]
            : args[0]

        const key = args.length === 2 
            ? args[0]
            : nil

        super(target)
        this[$$key] = key
    }

    //// Validate ////

    validate(
        input: object, 
        options?: ValidateOptions
    ): RecordValidatorOutput<K, V> {

        const vCtx = new ValidationContext(input, options)

        const transformed = vCtx.transformed = {} as GenericObject

        for (const key of each.keyOf(input)) {

            // Validate Key
            const kCtx = this[$$key] 
                ? new ValidationContext(key, options) 
                : nil

            const transformedKey = this[$$key]?.(key, kCtx) ?? key

            // Validate Value
            transformed[transformedKey] = this.of(input[key], vCtx)
        }

        const output = vCtx.transform ? vCtx.transformed : input
        if (!ValidatorStruct.equal(output, vCtx.transformed))
            throw new ValidationError(this, vCtx)

        return output as RecordValidatorOutput<K, V>
    }
} as unknown as RecordValidatorConstructor

//// Exports ////

export default RecordValidator

export {
    RecordValidator,
    RecordValidatorOutput,
    KeyValidator
}

