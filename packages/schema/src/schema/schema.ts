import { $$copy, $$equals, copy, CopyComparable, equals } from '@benzed/immutable'

import { isFunction, isInstanceOf, isNumber } from '@benzed/is'

import {

    TypeValidator,
    TypeValidatorSettings,

    Validator,
    DefaultValidator,
    DefaultValidatorSettings

} from '../validator'

import ValidationError from '../util/validation-error'

import { Flags, HasMutable, HasOptional } from './flags'
import { ascending } from '@benzed/array'

/* eslint-disable @typescript-eslint/no-explicit-any */

/*** Types ***/

type ApplyOptional<F extends Flags[], O> = HasOptional<F, O | undefined, O>
type ApplyMutable<F extends Flags[], O> = HasMutable<F, O, Readonly<O>>

type SchemaOutput<S extends Schema<any, any, any>> = S extends Schema<any, infer O, infer F>
    ? ApplyOptional<F, O>
    : never

type SchemaInput<S extends Schema<any, any, any>> =
    S extends Schema<infer I, any, any> ? I : unknown

// TODO Move Me
type Primitive = string | number | boolean | null | undefined

interface SchemaValidationContext {
    readonly transform: boolean
    readonly path: (string | number)[]
}

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

    /*** Construct ***/

    public constructor (input: I, ...flags: F) {
        this._input = input
        this._flags = flags
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

    public create(): ApplyOptional<F, O> {
        return this
            ._defaultValidator
            .transform(undefined) as ApplyOptional<F, O>
    }

    /*** Schema Methods ***/

    public cast(cast: NonNullable<TypeValidatorSettings<O>['cast']>): this {
        return this._copyWithTypeValidatorSettings({ cast })
    }

    public error(error: NonNullable<TypeValidatorSettings<O>['error']>): this {
        return this._copyWithTypeValidatorSettings({ error })
    }

    public default(def: NonNullable<DefaultValidatorSettings<O>['default']>): this {
        return this._copyWithDefaultValidatorSetting({ default: def })
    }

    /**
     * @returns schema with optional flag
     */
    public readonly optional = this._copyWithFlag.bind(this, Flags.Optional) as unknown
    public get isOptional(): boolean {
        return this._flags.includes(Flags.Optional)
    }

    /**
     * @returns schema with mutable flag 
     */
    public readonly mutable = this._copyWithFlag.bind(this, Flags.Mutable) as unknown
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

                if (
                    isOptional &&
                    isUndefinedPostDefaultValidation
                )
                    return output as unknown as ApplyOptional<F, O>

            } catch ({ message }) {
                throw new ValidationError(
                    message as string,
                    path
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

    /*** Immutable Helpers ***/

    private _copyWithInputAndFlags(input: I, ...flags: Flags[]): this {
        const ThisSchema = this.constructor as new (input: I, ...flags: Flags[]) => this

        const schema = new ThisSchema(input, ...flags)
        schema._typeValidator.applySettings(this._typeValidator.settings)
        schema._defaultValidator.applySettings(this._defaultValidator.settings)
        schema._postTypeValidators = copy(this._postTypeValidators)
        return schema
    }

    private _copyWithFlag(flag: Flags): this {
        if (this._flags.includes(flag))
            throw new Error(`Schema is already ${Flags[flag]}`)

        return this._copyWithInputAndFlags(this._input, ...this._flags, flag)
    }

    private _copyWithTypeValidatorSettings(settings: Partial<TypeValidatorSettings<O>>): this {
        const schema = this[$$copy]()
        schema._typeValidator.applySettings(settings)
        return schema
    }

    private _copyWithDefaultValidatorSetting(settings: Partial<DefaultValidatorSettings<O>>): this {
        const schema = this[$$copy]()
        schema._defaultValidator.applySettings(settings)
        return schema
    }

    protected _copyWithPostTypeValidator(
        validator: Validator<O>,
        id: string
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

    public constructor (input: I | (() => I), ...flags: F) {

        super(isFunction(input) ? input() : input, ...flags)

        this._defaultValidator.applySettings({
            default: input
        })
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

