import { Struct } from '@benzed/immutable'

import { 
    merge, 
    nil, 
    ParamPipe, 
    KeysOf, 
    InputOf, 
    Pipe, 
    isSymbol, 
    isFunc 
} from '@benzed/util'

import {

    AnyValidate,
    Validate,
    ValidateConstructor,
    ValidateInput,
    ValidateOptions,
    ValidateOutput,
    ValidationErrorMessage,
    Validator,
    ValidatorPredicate,
    ValidatorSettings,
    ValidatorTransform

} from '../validator'

//// Types ////

type SchemaValidator<V extends AnyValidate> = ParamPipe<ValidateInput<V>, ValidateOutput<V>, [ValidateOptions | nil]>
type SchemaValidate<V extends AnyValidate> = Validate<ValidateInput<V>, ValidateOutput<V>>
type SchemaPredicate<V extends AnyValidate> = ValidatorPredicate<ValidateInput<V>>
type SchemaTransform<V extends AnyValidate> = ValidatorTransform<ValidateInput<V>, ValidateOutput<V>>
type SchemaError<V extends AnyValidate> = ValidationErrorMessage<InputOf<V>> | string

type AddSchemaSettings<V extends AnyValidate> = ValidatorSettings<ValidateInput<V>, ValidateOutput<V>>

interface SchemaProperties<V extends AnyValidate> extends SchemaValidate<V>, Struct {
    validate: SchemaValidator<V>

    validates<Vx extends Partial<AddSchemaSettings<V>>>(settings: Vx, id?: symbol): this
    validates(validate: SchemaValidate<V>, id?: symbol): this

    asserts(is: SchemaPredicate<V>, error?: SchemaError<V>, id?: symbol): this
    transforms(to: SchemaTransform<V>, error?: SchemaTransform<V>, id?: symbol): this
}

type _SchemaDynamicKeys<V extends AnyValidate> = Exclude<KeysOf<V>, KeysOf<SchemaProperties<V>>>

type AnySchema = Schema<AnyValidate>

type Schema<V extends AnyValidate> = SchemaProperties<V> & {
    [K in _SchemaDynamicKeys<V>]: (input: V[K]) => Schema<V>
}

interface SchemaConstructor extends ValidateConstructor {

    replace<V extends AnyValidate>(schema: AnySchema, validate: V): Schema<V> 

    merge<V extends AnyValidate[]>(schema: AnySchema, ...validators: V): Schema<V[0]>
    merge<S extends AnySchema>(schema: S, ...validators: SchemaValidate<S>[]): S

    upsert<S extends AnySchema, V extends SchemaValidate<S>>(
        schema: S,
        update: (previous?: V) => V,
        id?: symbol
    ): S

    new <V extends AnyValidate>(validate: V): Schema<V>
}

//// Implementation ////

function schemaValidate <V extends AnyValidate>(this: Schema<V>, i: ValidateInput<V>, options?: ValidateOptions): ValidateOutput<V> {
    return this.validate(i, options)
}

//// Main ////

const Schema = class <V extends AnyValidate> extends Validate<ValidateInput<V>, ValidateOutput<V>> {

    //// Static ////

    static replace<V extends AnyValidate>(schema: AnySchema, validate: V): Schema<V> {
        const clone = schema.copy()
        merge(clone, { validate: Pipe.from(validate) })
        return clone as unknown as Schema<V>
    }

    static merge<V extends AnyValidate[]>(schema: AnySchema, ...validators: V): Schema<V[0]>
    static merge<S extends AnySchema>(schema: S, ...validators: SchemaValidate<S>[]): S {
        const validate = Validator.merge(schema.validate, ...validators as AnyValidate[])
        return this.replace(schema, validate) as S
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

        return this.merge(schema, ...updatedValidators) as S
    }

    //// Instance ////

    constructor(validate: V) {
        super(schemaValidate)
        this.validate = Pipe.from(validate) as SchemaValidator<V>
    }

    readonly validate: SchemaValidator<V>

    override get name(): string {
        return this.validate.name
    }

    validates<Vx extends Partial<AddSchemaSettings<V>>>(settings: Vx, id?: symbol): this
    validates(settings: AddSchemaSettings<V>, id?: symbol): this
    validates(input: SchemaValidate<V>, id?: symbol): this

    validates(
        input: Partial<AddSchemaSettings<V>> | SchemaValidate<V>,
        id = 'id' in input && isSymbol(input.id) ? input.id : nil
    ): this {
        const validate = (isFunc(input) ? input : Validator.create(input)) as AnyValidate
        return (
            isSymbol(id)
                ? Schema.upsert(this as AnySchema, () => validate, id)
                : Schema.merge(this as AnySchema, validate)
        ) as this
    }

    asserts(
        isValid: SchemaPredicate<V>,
        error?: SchemaError<V>,
        id?: symbol
    ): this {
        return this.validates({
            is: isValid,
            error,
            id
        })
    }

    transforms(
        transform: SchemaTransform<V>,
        error?: SchemaError<V>, 
        id?: symbol
    ): this {
        return this.validates({
            transform,
            error,
            id
        })
    }

    //// Main ////

    get validators(): AnyValidate[] {
        return Array.from(this)
    }

    *[Symbol.iterator](): IterableIterator<AnyValidate> {
        yield* this.validate.transforms as unknown as IterableIterator<AnyValidate>
    }

} as SchemaConstructor

//// Exports ////

export default Schema 

export {
    Schema,
    AnySchema
}