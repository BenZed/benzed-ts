import { unique } from '@benzed/array'
import { Struct, ValueCopy } from '@benzed/immutable'
import { capitalize } from '@benzed/string'

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
    Property,
    keysOf,
    defined,
} from '@benzed/util'

import {

    AnyValidate,
    AnyValidatorSettings,
    Validate,
    ValidateConstructor,
    ValidateOptions,
    ValidateOutput,
    ValidationErrorMessage,
    Validator,
    ValidatorPredicate,
    ValidatorSettings,
    ValidatorTransform,
    ValidatorTypeGuard,

} from '../validator'

//// EsLint ////
/* eslint-disable 
    @typescript-eslint/no-explicit-any,
    @typescript-eslint/ban-types
*/

//// Helper Types ////

type _SchemaSettingDisallowedKeys = KeysOf<SchemaProperties<unknown, unknown, object>> | 'is' | 'transform' | 'id'
type _NameToNamed<O extends object> = 'name' extends keyof O ? 'named' : never

type _SchemaSettingKeys<O extends object> = Exclude<KeysOf<O>, _SchemaSettingDisallowedKeys>
type _SchemaSetterKeys<O extends object> = 
    | Exclude<KeysOf<O>, _SchemaSettingDisallowedKeys | 'name'> 
    | _NameToNamed<O>

type _SchemaSetters<I,O,T extends object> = {
    [K in _SchemaSetterKeys<T>]: K extends 'named' 
        ? (input: string) => Schema<I, O, T>
        : K extends keyof T 
            ? (input: T[K]) => Schema<I, O, T>
            : never
}
    
//// Types ////

type ToSchemaSettings<O extends object> = O extends AnyValidatorSettings
    ? { 
        [K in Exclude<KeysOf<AnyValidatorSettings> | KeysOf<O>, _SchemaSettingDisallowedKeys>]: K extends keyof O 
            ? O[K]
            : K extends keyof AnyValidatorSettings
                ? AnyValidatorSettings[K]
                : never
    }
    : { [K in _SchemaSettingKeys<O>]: O[K] }

type SchemaValidator<I, O> = ParamPipe<I, O, [ValidateOptions | nil]>
type SchemaValidate<O> = Validate<O,O>
type SchemaError<I> = ValidationErrorMessage<I> | string

interface SchemaProperties<I, O, T extends object> extends Validate<I, O>, Struct {

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

type Schema<I, O, T extends object> = SchemaProperties<I, O, T> & _SchemaSetters<I, O, T>

type AnySchema = Schema<unknown, unknown, object>

type ToSchema<V> = 
    V extends { is: Validate<infer I, boolean> } 
        ? Schema<I, I, ToSchemaSettings<V>>
        : V extends { is: (i: unknown, options?: ValidateOptions) => i is infer O } | { transform: Validate<infer I, unknown> }

            ? Schema<I, O, ToSchemaSettings<V>>
            : V extends Validate<infer I, infer O>

                ? Schema<I, O, {}>
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

    new <V extends object>(validate: V): ToSchema<V>
}

//// Implementation ////

function schemaValidate <I,O>(this: { validate: Validate<I, O> }, i: I, options?: ValidateOptions): O {
    return this.validate(i, options)
}

function getSettingsValidator(schema: { validate: AnyValidate }): AnyValidate {
    return schema.validate instanceof Pipe
        ? schema.validate.transforms[0]
        : schema.validate
}

// Move me to @benzed/immutable TODO
interface ValueApply extends ValueCopy {
    apply(settings: object): this
}

function ensureSetters(object: ValueApply, settings: object): void {
        
    const disallowedKeys = Array
        .from(keysOf(Schema.prototype))
        .concat('value', 'is', 'transform', 'id')
        .filter(unique)

    const descriptors = Property.descriptorsOf(settings)

    const allowedKeys = Array
        .from(keysOf(descriptors))
        .filter(k => !disallowedKeys.includes(k))

    for (const key of allowedKeys) {
        const descriptor = descriptors[key]
        const accessible = descriptor.writable || 'getter' in descriptor && 'setter' in descriptor 
        if (!descriptor || !accessible)
            continue

        const name = key === 'name' ? 'named' : key
        const hasSetter = isFunc((object as unknown as Record<string, Func | nil>)[name])
        if (hasSetter)
            continue 

        const setter = Property.name(function (this: ValueApply, value: unknown) {
            const schema = this.copy()
            schema.apply({ [key]: value })

            return schema
        }, `set${capitalize(key)}`)

        Property.define(object, name, { enumerable: false, value: setter })
    }
}

//// Main ////

const Schema = class extends Validate<unknown, unknown> {

    //// Static ////

    static replace<S extends AnySchema, V extends Validate<InputOf<S>, OutputOf<S>>>(
        schema: S, 
        validate: V
    ): S {
        const clone = schema.copy()
        merge(clone, { validate: Pipe.from(validate as Validate<unknown>) })
        return clone
    }

    static merge<S extends AnySchema, V extends SchemaValidate<ValidateOutput<S>>[]>(
        schema: S, 
        ...validators: V
    ): S {
        const validate = Validator.merge(schema.validate as Func, ...validators as Func[])
        return this.replace(schema, validate)
    }

    static upsert<S extends AnySchema, V extends SchemaValidate<S>>(
        schema: S,
        update: (previous?: V) => V,
        id?: symbol
    ): S {

        const updatedValidators = Pipe.flatten([schema.validate as AnyValidate])

        const index = id ? updatedValidators.findIndex(v => 'id' in v && v.id === id) : -1
        const isNew = index < 0

        const validator = update(isNew ? updatedValidators[index] as V : nil) as AnyValidate
        if (isNew)
            updatedValidators.push(validator)
        else
            updatedValidators.splice(index, 1, validator)

        return this.merge(schema, ...updatedValidators as Func[]) as S
    }

    //// Instance ////

    constructor(settings: object) {
        super(schemaValidate)

        this.validate = Validator.from(settings)
        this.apply(settings)
    }

    get settings(): object {
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
            is: isValid,
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

    override apply(settings: object): this {

        ensureSetters(this as AnySchema, settings)

        const validator = getSettingsValidator(this)

        // apply settings to main validator
        for (const key of keysOf(settings))
            validator[key] = settings[key]

        return this
    }

    //// Iteration ////

    get validators(): AnyValidate[] {
        return Array.from(this)
    }

    *[Symbol.iterator](): IterableIterator<AnyValidate> {
        yield* this.validate.transforms as unknown as IterableIterator<AnyValidate>
    }

    //// Struct ////

    override get state(): Partial<this> {
        const { validate } = this
        return { validate } as Partial<this>
    }

    override set state(value: Partial<this>) {
        const { validate } = value
        if (!validate)
            throw new Error('Invalid state.')
        
        merge(this, { validate })
    }

} as unknown as SchemaConstructor

//// Exports ////

export default Schema 

export {
    Schema,
    AnySchema
}