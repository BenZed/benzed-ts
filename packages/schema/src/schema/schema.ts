import { $$copy, $$equals, copy, CopyComparable, equals } from '@benzed/immutable'

import { isFunction, isInstanceOf } from '@benzed/is'

import {

    TypeValidator,
    TypeValidatorSettings,

    Validator,
    DefaultValidator,
    DefaultValidatorSettings

} from '../validator'

import ValidationError from '../util/validation-error'

import { Flags, HasOptional } from './flags'

/* eslint-disable @typescript-eslint/no-explicit-any */

/*** Types ***/

type ApplyOptional<F extends Flags[], O> = HasOptional<F, O | undefined, O>

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

/*** Main ***/

abstract class Schema<I, O, F extends Flags[] = []> implements CopyComparable<Schema<I, O, F>> {

    protected readonly _flags: F
    protected readonly _input: I

    protected readonly _defaultValidator: DefaultValidator<O> = new DefaultValidator({})
    protected readonly abstract _typeValidator: TypeValidator<O>
    protected _validators: Validator<O>[] = []

    public get validators(): readonly [DefaultValidator<O>, TypeValidator<O>, ...Validator<O>[]] {
        return [
            this._defaultValidator,
            this._typeValidator,
            ...this._validators
        ]
    }

    // Construct

    public constructor (input: I, ...flags: F) {
        this._input = input
        this._flags = flags
    }

    // Data Methods

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

    // Schema Methods

    public cast(cast: NonNullable<TypeValidatorSettings<O>['cast']>): this {
        return this._copyWithTypeValidatorSettings({ cast })
    }

    public error(error: NonNullable<TypeValidatorSettings<O>['error']>): this {
        return this._copyWithTypeValidatorSettings({ error })
    }

    public default(def: NonNullable<DefaultValidatorSettings<O>['default']>): this {
        return this._copyWithNewDefaultSetting({ default: def })
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
    public readonly clearFlags = (() => this._copyConstruct(this._input)) as unknown

    // Main

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

    // Helper

    private _copyWithFlag(flag: Flags): this {

        if (this._flags.includes(flag))
            throw new Error(`Schema is already ${Flags[flag]}`)

        return this._copyConstruct(this._input, ...this._flags, flag)
    }

    private _copyWithTypeValidatorSettings(settings: Partial<TypeValidatorSettings<O>>): this {
        const schema = this[$$copy]()
        schema._typeValidator.applySettings(settings)
        return schema
    }

    private _copyWithNewDefaultSetting(settings: Partial<DefaultValidatorSettings<O>>): this {
        const schema = this[$$copy]()
        schema._defaultValidator.applySettings(settings)
        return schema
    }

    private _copyConstruct(input: I, ...flags: Flags[]): this {
        const ThisSchema = this.constructor as new (input: I, ...flags: Flags[]) => this

        const schema = new ThisSchema(input, ...flags)
        schema._typeValidator.applySettings(this._typeValidator.settings)
        schema._defaultValidator.applySettings(this._defaultValidator.settings)
        schema._validators = copy(this._validators)
        return schema
    }

    // CopyComparable implementation

    public [$$copy](): this {
        return this._copyConstruct(this._input, ...this._flags)
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

abstract class PrimitiveSchema
/**/<
    I extends Primitive,
    F extends Flags[] = []
/**/>
    extends Schema<I, I, F> {

    public constructor (input: I | (() => I), ...flags: F) {
        super(isFunction(input) ? input() : input, ...flags)

        this._defaultValidator.applySettings({
            default: input
        })
    }

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

    ApplyOptional
}

