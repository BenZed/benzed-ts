import { copy, Struct } from '@benzed/immutable'

import {
    merge,
    nil,
    ParamPipe,
    KeysOf,
    Pipe,
    isSymbol,
    isFunc,
    InputOf,
    OutputOf,
    Func,
    keysOf,
    defined,
    Infer,
} from '@benzed/util'

import {
    AnyValidate,
    GenericValidatorSettings as SchemaSettings,
    Validate,
    ValidateConstructor,
    ValidateContext,
    ValidateOptions,
    ValidateOutput,
    ValidationErrorMessage,
    Validator,
    ValidatorPredicate,
    ValidatorSettings,
    ValidatorTransform,
} from '../validator'

import { ToValidator } from '../validator/validator-from'

import ensureSetters from './ensure-setters'
import { schemaMerge } from './schema-merge'
import { schemaReplace } from './schema-replace'
import { schemaUpsert } from './schema-upsert'

//// EsLint ////

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
    @typescript-eslint/ban-types
*/

//// Helper Types ////

type _ValidatorSettingKeys = KeysOf<ValidatorSettings<any,any>>

type _SchemaSettingDisallowedKeys = 
    KeysOf<SchemaProperties<unknown, unknown, SchemaSettings>> | 
    Extract<_ValidatorSettingKeys, 'transform' | 'isValid' | 'id'>

    type _NameToNamed<O extends object> = 'name' extends keyof O ? 'named' : never

type _SchemaSettingKeys<O extends object> = Exclude<KeysOf<O>, _SchemaSettingDisallowedKeys>
type _SchemaSetterKeys<O extends object> = 
    | Exclude<KeysOf<O>, _SchemaSettingDisallowedKeys | 'name'> 
    | _NameToNamed<O>

type _SchemaSetters<I, O, T extends SchemaSettings> = {
    [K in _SchemaSetterKeys<T>]: K extends 'named' 
        ? (input: string) => Schema<I, O, T>
        : K extends keyof T 
            ? (input: T[K]) => Schema<I, O, T>
            : never
}

type _ToSchemaSettings<I, O extends object> = Infer<{ 
    [K in _SchemaSettingKeys<O>]: K extends _ValidatorSettingKeys 
        ? ValidatorSettings<I>[K]
        : O[K]
}, SchemaSettings>
    
//// Types ////

type SchemaValidator<I, O> = ParamPipe<I, O, [ValidateOptions | nil]>
type SchemaValidate<O> = Validate<O,O>
type SchemaError<I> = ValidationErrorMessage<I> | string

interface SchemaProperties<I, O, T extends SchemaSettings> extends Validate<I, O>, Struct {

    settings: T

    /**
     * Mutably change this schema's settings
     */
    apply(settings: Partial<T>): this

    validate: SchemaValidator<I, O>

    validates<Vx extends Partial<ValidatorSettings<O, O>>>(settings: Vx): this
    validates(validate: ValidatorPredicate<I>): this

    asserts(isValid: ValidatorPredicate<O>, error?: SchemaError<I>): this
    transforms(transform: ValidatorTransform<O,O>, error?: SchemaError<I>): this

}

type Schema<I, O, T extends SchemaSettings> = SchemaProperties<I, O, T> & _SchemaSetters<I, O, T>

type AnySchema = Schema<unknown, unknown, SchemaSettings>

type ToSchema<V extends AnyValidate | SchemaSettings> = V extends Validate<infer I, infer O> 
    ? Schema<I,O, _ToSchemaSettings<I, V>>
    : V extends SchemaSettings 
        ? ToValidator<V> extends Validate<infer I, infer O>
            ? Schema<I,O, _ToSchemaSettings<I, V>>
            : never
        : never 

interface SchemaConstructor extends ValidateConstructor {

    replace<S extends AnySchema, V extends Validate<InputOf<S>, OutputOf<S>>>(
        schema: S, 
        validate: V
    ): S

    merge<S extends AnySchema, V extends SchemaValidate<ValidateOutput<S>>[]>(schema: S, ...validators: V): S

    upsert<S extends AnySchema, V extends SchemaValidate<ValidateOutput<S>>>(
        schema: S,
        update: (previous?: V) => V,
        id?: symbol
    ): S
 
    new <V extends SchemaSettings | AnyValidate>(validate: V): ToSchema<V>
}

//// Implementation ////

function schemaValidate <I,O>(this: { validate: Validate<I, O> }, i: I, options?: Partial<ValidateOptions>): O {
    const ctx = new ValidateContext(i, options)

    return this.validate(i, ctx)

}

function getSettingsValidator(schema: { validate: Func }): AnyValidate {
    return schema.validate instanceof Pipe
        ? schema.validate.transforms[0]
        : schema.validate
}

//// Main ////

const Schema = class extends Validate<unknown, unknown> {

    //// Static ////

    static replace = schemaReplace

    static merge = schemaMerge
    static upsert = schemaUpsert

    //// Instance ////

    constructor(settings: SchemaSettings) {
        super(schemaValidate)

        this.validate = Pipe.from(Validator.from(settings))
        this._apply(settings)
    }

    get settings(): SchemaSettings {
        return defined(getSettingsValidator(this))
    }

    readonly validate: SchemaValidator<unknown, unknown>

    override get name(): string {
        return getSettingsValidator(this).name
    }

    validates(
        input: Partial<ValidatorSettings<unknown>> | SchemaValidate<unknown>,
        id = 'id' in input && isSymbol(input.id) ? input.id : nil
    ): this {
        const validate = (isFunc(input) ? input : Validator.from(input)) as AnyValidate

        const anySchema = this as unknown as AnySchema

        return (
            isSymbol(id)
                ? Schema.upsert(anySchema, () => validate, id)
                : Schema.merge(anySchema, validate)
        ) as unknown as this
    }

    asserts(
        isValid: ValidatorPredicate<unknown>,
        error?: SchemaError<unknown>,
        id?: symbol
    ): this {
        return this.validates({
            isValid,
            error,
            id
        })
    }

    transforms(
        transform: ValidatorTransform<unknown>,
        error?: SchemaError<unknown>, 
        id?: symbol
    ): this {
        return this.validates({
            transform,
            error,
            id
        })
    }

    override apply(settings: SchemaSettings): this {
        return this.copy()._apply(settings)
    }

    //// Iteration ////

    get validators(): AnyValidate[] {
        return Array.from(this)
    }

    *[Symbol.iterator](): IterableIterator<AnyValidate> {
        yield* this.validate.transforms as unknown as IterableIterator<AnyValidate>
    }

    //// Struct ////

    protected _apply(settings: SchemaSettings): this {
        ensureSetters(this, settings)

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
            validate = Pipe.from(...validate.transforms.map(copy))
        
        merge(this, { validate })
    }

} as unknown as SchemaConstructor

//// Exports ////

export default Schema 

export {
    Schema,
    AnySchema,
    SchemaValidate
}