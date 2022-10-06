
import {
    Validator,
} from '../validator'

import {
    TypeValidator,
    TypeValidatorSettings
} from '../validator/type'

import {
    DefaultValidator,
    DefaultValidatorSettings
} from '../validator/default'

import ValidationError from '../util/validation-error'

import {
    Flags,
    HasMutable,
    HasOptional
} from './flags'

import {
    $$copy,
    $$equals,
    copy,
    equals,
    CopyComparable
} from '@benzed/immutable'

import {
    isInstanceOf,
    isNumber,
    isString
} from '@benzed/is'

import {
    ascending
} from '@benzed/array'

/* eslint-disable @typescript-eslint/no-explicit-any */

/*** Types ***/

type ApplyMutable<F extends Flags[], O> = HasMutable<F, O, Readonly<O>>
type ApplyOptional<F extends Flags[], O> = HasOptional<F, O | undefined, O>

type SchemaOutput<S extends Schema<any, any, any>> = S extends Schema<any, infer O, infer F>
    ? ApplyOptional<F, O>
    : never

type SchemaInput<S extends Schema<any, any, any>> =
    S extends Schema<infer I, any, any> ? I : unknown

type Primitive = string | number | boolean | null | undefined

interface SchemaValidationContext {
    readonly transform: boolean
    readonly path: (string | number)[]
}

type TypeSetting<O, K extends keyof TypeValidatorSettings<O>> =
    NonNullable<TypeValidatorSettings<O>>[K]

type DefaultSetting<O, K extends keyof DefaultValidatorSettings<O>> =
    NonNullable<DefaultValidatorSettings<O>>[K]

/*** Schema Class ***/

abstract class Schema<I, O, F extends Flags[] = []> implements CopyComparable<Schema<I, O, F>> {

    protected readonly _flags: F
    protected readonly _input: I

    protected readonly _defaultValidator: DefaultValidator<O> = new DefaultValidator({})
    protected readonly abstract _typeValidator: TypeValidator<O>
    private _postTypeValidators: Map<string | number, Validator<O>> = new Map()

    public get validators(): readonly [
        DefaultValidator<O>,
        TypeValidator<O>,
        ...Validator<O>[]
    ] {
        return [
            this._defaultValidator,
            this._typeValidator,
            ...this._postTypeValidators.values()
        ]
    }

    public get typeName(): string {
        return this._typeValidator.settings.name
    }

    /*** Construct ***/

    public constructor (input: I, ...flags: F) {
        this._input = input
        this._flags = flags
        this.is = this.is.bind(this)
        this.assert = this.assert.bind(this)
        this.validate = this.validate.bind(this)

        Object.defineProperties(this, {
            optional: {
                get() {
                    return this._copyWithFlag(Flags.Optional) 
                },
                enumerable: true
            },
            mutable: {
                get() {
                    return this._copyWithFlag(Flags.Mutable) 
                },
                enumerable: true,
            }
        })
    }

    /*** Data Methods ***/

    public is(input: unknown): input is ApplyOptional<F, O> {
        try {
            this.assert(input)
            return true
        } catch {
            return false
        }
    }

    public assert(input: unknown): asserts input is ApplyOptional<F, O> {
        void this._validate(input, { transform: false })
    }

    public validate(input: unknown): ApplyOptional<F, O> {
        return this._validate(input, { transform: true })
    }

    /*** Schema Methods ***/

    public name(
        option: TypeSetting<O, 'name'> | Partial<Pick<TypeValidatorSettings<O>, 'name' | 'article'>>
    ): this {

        const { name, article } = isString(option) ? { name: option, article: undefined } : option

        return this._copyWithTypeValidatorSettings({ name, article })
    }

    public cast(cast: TypeSetting<O, 'cast'>): this {
        return this._copyWithTypeValidatorSettings({ cast })
    }

    public error(error: TypeSetting<O, 'error'>): this {
        return this._copyWithTypeValidatorSettings({ error })
    }

    public default(defaultValue: DefaultSetting<O, 'default'>): this {

        const newSchema = this[$$copy]()
        newSchema._applyDefaultValue(defaultValue)
        return newSchema
    }

    public map<O extends Schema<any,any,any>>(map: (i: this) => O): O {
        return map(this)
    }

    /**
     * @returns schema with optional flag
     */
    public abstract readonly optional: unknown 
    public get isOptional(): boolean {
        return this._flags.includes(Flags.Optional)
    }

    /**
     * @returns schema with mutable flag 
     */
    public abstract readonly mutable: unknown 
    public get isMutable(): boolean {
        return this._flags.includes(Flags.Mutable)
    }

    /**
     * @returns schema without optional or mutable flags.
     */
    public readonly clearFlags = (() => this._copyWithInputAndFlags(this._input)) as unknown

    /*** Main ***/

    protected _validate(
        input: unknown,
        inputContext: Partial<SchemaValidationContext>
    ): ApplyOptional<F, O> {

        const {
            transform: allowTransform = true,
            path = []
        } = inputContext

        const { validators, isOptional } = this

        let output = input
        for (const validator of validators) {

            try {

                output = validator.validate(output as O, allowTransform)

                const isUndefinedPostDefaultValidation =
                    // after default validation
                    validator instanceof DefaultValidator &&
                    // still undefined 
                    output === undefined
                if (!isUndefinedPostDefaultValidation)
                    continue

                if (isOptional)
                    return output as ApplyOptional<F, O>
                else 
                    throw new Error('is required')

            } catch ({ message }) {
                throw new ValidationError(
                    message as string,
                    path,
                    output
                )
            }
        }

        return output as ApplyOptional<F, O>
    }

    /*** Mutable Helpers ***/

    protected _getPostTypeValidator(
        id: string
    ): Validator<O> | undefined {
        return this._postTypeValidators.get(id)
    }

    protected _setPostTypeValidator(
        id: string,
        validator: Validator<O>
    ): void {
        this._postTypeValidators.set(id, validator)
    }

    protected _removePostTypeValidator(
        id: string,
    ): boolean {
        if (!this._postTypeValidators.has(id))
            return false

        this._postTypeValidators.delete(id)
        return true
    }

    protected _addLoosePostTypeValidator(
        validator: Validator<O>
    ): void {

        const highestExistingNumericalId = [...this._postTypeValidators.keys()]
            .filter(isNumber)
            .sort(ascending)
            .at(-1) ?? -1

        const newNumericalId = highestExistingNumericalId + 1

        this._postTypeValidators.set(newNumericalId, validator)
    }

    protected _applyDefaultValue(defaultValue: DefaultValidatorSettings<O>['default']): void {
        this._defaultValidator.applySettings({ default: defaultValue })
    }

    /*** Immutable Helpers ***/

    private _copyWithInputAndFlags(input: I, ...flags: Flags[]): this {
        const ThisSchema = this.constructor as new (input: I, ...flags: Flags[]) => this

        const schema = new ThisSchema(input, ...flags)
        schema._typeValidator.applySettings(this._typeValidator.settings)
        schema._postTypeValidators = copy(this._postTypeValidators)
        schema._defaultValidator.applySettings(this._defaultValidator.settings)
        return schema
    }

    protected _copyWithFlag(flag: Flags): this {
        if (this._flags.includes(flag))
            throw new Error(`Schema is already ${Flags[flag]}`)

        return this._copyWithInputAndFlags(this._input, ...this._flags, flag)
    }

    private _copyWithTypeValidatorSettings(settings: Partial<TypeValidatorSettings<O>>): this {
        const schema = this[$$copy]()
        schema._typeValidator.applySettings(settings)
        return schema
    }

    protected _copyWithPostTypeValidator(
        id: string,
        validator: Validator<O>,
    ): this {
        const schema = this[$$copy]()
        schema._setPostTypeValidator(id, validator)
        return schema
    }

    protected _copyWithLoosePostTypeValidator(
        validator: Validator<O>
    ): this {
        const schema = this[$$copy]()
        schema._addLoosePostTypeValidator(validator)
        return schema
    }

    /*** CopyComparable Implemention ***/

    public [$$copy](): this {
        return this._copyWithInputAndFlags(this._input, ...this._flags)
    }

    public [$$equals](other: unknown): other is this {
        return (
            // is this schema
            isInstanceOf(other, this.constructor) &&
            // flags match
            equals(other._flags, this._flags) &&
            // type settings match
            equals(other.validators, this.validators)
        )
    }
}

/*** Primitive Schema ***/

abstract class PrimitiveSchema<I extends Primitive, F extends Flags[] = []>
    extends Schema<I, I, F> {

    public get $identity(): I {
        return this._input
    }
}

/*** Parent Schema ***/

abstract class ParentSchema<I, O, F extends Flags[]>
    extends Schema<I, O, F> {

    protected override _validate(
        input: unknown,
        inputContext: Partial<SchemaValidationContext>
    ): ApplyOptional<F, O> {

        const context = {
            path: [],
            transform: false,
            ...inputContext,
        }

        const output = super._validate(input, context)
        if (output === undefined)
            return output as ApplyOptional<F, O>

        return this._validateChildren(output, context) as ApplyOptional<F, O>
    }

    public get $(): I {
        return this._input
    }

    protected abstract _validateChildren(
        input: O,
        inputContext: SchemaValidationContext
    ): O

}

/*** Exports ***/

export default Schema

export {

    Schema,
    SchemaInput,
    SchemaOutput,
    SchemaValidationContext,

    PrimitiveSchema,
    Primitive,

    ParentSchema,

    ApplyOptional,
    ApplyMutable
}

