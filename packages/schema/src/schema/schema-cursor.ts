import { copy, Struct } from '@benzed/immutable'

import {
    merge,
    nil,
    ParamPipe,
    KeysOf,
    Pipe,
    keysOf,
    defined,
    Infer,
    omit,
} from '@benzed/util'
 
import {
    AnyValidate,
    GenericValidatorSettings as SchemaSettings,
    Validate,
    ValidateContext,
    ValidateOptions,
    ValidationErrorInput,
    Validator,
    ValidatorSettings,
} from '../validator'

import ensureAccessors, { DISALLOWED_KEYS, getSettingsValidator } from './ensure-setters'

import type { AnySchema, Schema } from './schema'

//// EsLint ////

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
    @typescript-eslint/ban-types
*/

//// Helper Types ////

type _DISALLOWED_KEYS = typeof DISALLOWED_KEYS[number]

type _ValidatorSettingKeys = KeysOf<ValidatorSettings<unknown,unknown>>

    type _NameToNamed<O extends object> = 'name' extends keyof O 
        ? 'named' 
        : never

type _SchemaSetterKeys<O extends object> = 
    | Exclude<KeysOf<O>, _DISALLOWED_KEYS | 'name'> 
    | _NameToNamed<O>

type _SchemaSubValidateOptions<V extends AnyValidate> = Infer<{
    [K in Exclude<KeysOf<V>, _DISALLOWED_KEYS | 'name'>]: V[K]
}>

type _SchemaSubValidateSetter<V extends AnyValidate, I, O, T extends SchemaSettings> = 
    (
        errorSettingsOrEnabled?: ValidationErrorInput<I> | boolean | Partial<_SchemaSubValidateOptions<V>>
    ) => Schema<I, O, T>

type _SchemaSettingKeys<O extends object> = Exclude<KeysOf<O>, _DISALLOWED_KEYS>

//// Types ////

type ValidatorPipe<I, O> = ParamPipe<I, O, [Partial<ValidateOptions> | nil]>

type AnyValidatorPipe = ValidatorPipe<any, any>

interface SchemaCursorProperties<I, O, T extends SchemaSettings> extends Validate<I, O>, Struct {

    readonly settings: T

    apply(settings: Partial<T>): this

    readonly validate: ValidatorPipe<I, O>

}

type SchemaSetters<I, O, T extends SchemaSettings> = {
    [K in _SchemaSetterKeys<T>]: K extends 'named'

        ? (input: string) => Schema<I, O, T>
        : T[K] extends AnyValidate
            ? _SchemaSubValidateSetter<T[K], I, O, T>
            : K extends keyof T 
                ? (input: T[K]) => Schema<I, O, T>
                : never
}

type ToSchemaSettings<I, O extends object> = Infer<{ 
    [K in _SchemaSettingKeys<O>]: K extends _ValidatorSettingKeys 
        ? ValidatorSettings<I>[K]
        : O[K]
}, SchemaSettings>

//// Implementation ////

function cursorValidate <I,O>(this: { validate: Validate<I, O> }, i: I, options?: Partial<ValidateOptions>): O {
    const ctx = new ValidateContext(i, options)
    return this.validate(i, ctx)
}

//// Main ////

abstract class SchemaCursor<I, O, T extends SchemaSettings> extends Validate<I, O> implements SchemaCursorProperties<I, O, T> {

    //// Instance ////

    constructor(settings: T) {
        super(cursorValidate)

        const validator = Validator.from(settings) as Validate<I, O>

        this.validate = Pipe.from(validator)

        this._apply(settings)
    }

    get settings(): T {

        return Pipe.from(getSettingsValidator)
            .to(defined)
            .to(s => omit(s, ...DISALLOWED_KEYS) as T)
            .to(s => {
                for (const key of keysOf(s)) {
                    if (s[key] instanceof Validate) {
                        const validator = s[key] as AnyValidate

                        s[key] = validator instanceof SchemaCursor
                            ? validator.settings
                            : omit({ ...validator }, ...DISALLOWED_KEYS)
                    }
                }
                return s
            })
            (this) 
    }

    override get name(): string {
        return getSettingsValidator(this).name
    }

    override apply(settings: Partial<T>): this {
        return this.copy()._apply(settings)
    }

    readonly validate: ValidatorPipe<I, O>

    //// Struct ////

    protected _apply(settings: Partial<T>): this {
        ensureAccessors(this as unknown as AnySchema, settings)

        const validator = getSettingsValidator(this)

        // apply settings to main validator
        for (const key of keysOf(settings))
            (validator as any)[key] = settings[key]

        return this
    }

    override get state(): Partial<this> {
        const { validate } = this
        return { validate } as Partial<this>
    }

    override set state(value: Partial<this>) {
        let { validate } = value
        if (!validate)
            throw new Error('Invalid state.')

        if (validate instanceof Pipe)
            validate = Pipe.from(...validate.transforms.map(copy)) as this['validate']
        
        merge(this, { validate })
    }

} 

//// Exports ////

export default SchemaCursor 

export {

    SchemaCursor,
    SchemaSettings,
    SchemaSetters,
    ToSchemaSettings,

    ValidatorPipe,
    AnyValidatorPipe
}