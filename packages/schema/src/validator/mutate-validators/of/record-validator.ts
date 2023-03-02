
import { Copyable, equals } from '@benzed/immutable'
import { Mutate } from '@benzed/traits'
import { nil, GenericObject, each, assign } from '@benzed/util'

import { ValidationContext } from '../../../validation-context'
import { ValidateOutput } from '../../../validate'
import { Validator } from '../../validator'

import Of from '../of'

//// Symbol ////

const $$key = Symbol('key-validator')

//// Helper Types ////

type Key = symbol | string | number 

type _RecordValidatorWrapBuilderOutput<K extends Key, V extends Validator, P> = 
    P extends V
        ? RecordValidator<K, V>
        : P extends (...args: infer A) => V 
            ? (...args: A) => RecordValidator<K, V> 
            : P

type _RecordValidatorProperties<K extends Key, V extends Validator> = {
    [Vk in keyof V]: _RecordValidatorWrapBuilderOutput<K, V, V[Vk]>
} & {
    readonly [$$key]?: KeyValidator<K>
}

//// Types ////

type KeyValidator<K extends Key> = Validator<Key, K>

type RecordValidator<K extends Key, V extends Validator> = 
    Of<V, RecordValidatorOutput<K, V>> 
    & _RecordValidatorProperties<K, V>

type RecordValidatorOutput<K extends Key, V extends Validator> =
    Record<K, ValidateOutput<V>>

interface RecordValidatorConstructor {
    new <V extends Validator>(of: V): RecordValidator<Key, V>
    new <K extends Key, V extends Validator>(key: KeyValidator<K>, of: V): RecordValidator<K, V>
}

//// Main ////

const RecordValidator = class RecordValidator<
    K extends symbol | string | number,
    V extends Validator,
>
    extends Of<V, RecordValidatorOutput<K, V>> {

    protected readonly [$$key]: KeyValidator<K> | nil

    //// Construct ////
    
    constructor(value: V)
    constructor(key: KeyValidator<K>, target: V)
    constructor(...args: [KeyValidator<K>, V] | [V]) {

        const [key, target] = args.length === 2 
            ? args
            : [nil, args[0]]

        super(target)
        this[$$key] = key
    }

    //// Validate ////

    [Mutate.set](recordValidator: this, key: PropertyKey, value: unknown) {

        const target = key === $$key || Reflect.has(recordValidator, key)
            ? recordValidator
            : recordValidator[Mutate.target]
        
        return Reflect.set(target, key, value)
    }

    [Copyable.copy](): this {
        const copy = super[Copyable.copy]()

        assign(copy, { [$$key]: this[$$key] })
        return copy
    }

    [Validator.analyze](ctx: ValidationContext) {

        const transformed = ctx.transformed = {} as GenericObject

        for (const key of each.keyOf(ctx.input)) {

            // Validate Value
            const vCtx = this.of[Validator.analyze](ctx.pushSubContext(ctx.input[key], key))
            if (!vCtx.hasValidOutput())
                return vCtx

            // Validate Key
            let tKey = key
            if (this[$$key]) {

                const kCtx = this[$$key][Validator.analyze](new ValidationContext(
                    key as K, 
                    { transform: ctx.transform }) 
                )
                if (!kCtx.hasValidOutput()) 
                    return kCtx

                tKey = kCtx.getOutput()
            }

            transformed[tKey] = vCtx.getOutput()
        }

        return !ctx.transform && !equals(transformed, ctx.input)
            ? ctx.setError('must be a record')
            : ctx.setOutput(transformed)

    }
} as unknown as RecordValidatorConstructor

//// Exports ////

export default RecordValidator

export {
    RecordValidator,
    RecordValidatorOutput,
    KeyValidator
}

