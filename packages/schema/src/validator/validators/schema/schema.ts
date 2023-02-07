import { capitalize } from '@benzed/string'
import { RecordStruct } from '@benzed/immutable'
import { isFunc, isString, keysOf, NamesOf, pick, Property } from '@benzed/util'

import {
    AnyValidate,
    Validate,
    ValidateOptions,
    ValidateOutput
} from '../../../validate'

import { getAllProperties } from './property-helpers'

import { ValidationContext } from '../../../validation-context'

import {
    ValidationError,
    ValidationErrorMessage
} from '../../../validation-error'

import { 
    $$settings,
    ValidateStruct, 
    ValidateSettings, 
    ValidateUpdateSettings,
    AnyValidateStruct
} from '../../validate-struct'

import { ValidatorStruct } from '../../validator-struct'

//// EsLint ////

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
    @typescript-eslint/ban-types,
*/

//// Data ////

const $$schema = Symbol('temp-return-type')
const $$main = Symbol('main-validator')
const $$sub = Symbol('sub-validators')

//// Schema Helper Types ////

/**
 * @internal
 */
export type _SettingsKeysOf<V extends AnyValidateStruct> = 
    Extract<'name' | 'message' | 'enabled' | NamesOf<ValidateSettings<V>>, NamesOf<V>>

/**
 * @internal
 */
export type _SchemaSetterRequiringRemap<A extends any[]> = 
    (...args: A) => typeof $$schema

/**
 * @internal
 */
export type _SchemaOptionSetters<T extends AnyValidateStruct> = {
    [K in _SettingsKeysOf<T>]: _SchemaOptionSetter<T[K]>
}

type _SchemaOptionSetter<T> = (option: T) => typeof $$schema

type _SchemaSubSetters<S extends AnySubValidators> = {
    [K in NamesOf<S>]: _SchemaSubSetter<S[K]>
}

type _SchemaSubSetter<T extends AnyValidateStruct> = 
    T extends { configure: (...args: infer A) => object }

        // If the sub valiator defines a configuration signature, 
        // the setter will use that signature
        ? (...args: A) => typeof $$schema

        // otherwise it will accept a state object
        : (state: ValidateUpdateSettings<T>) => typeof $$schema

type _SchemaSetters<
    M extends AnyValidateStruct, 
    S extends SubValidators<ValidateOutput<M>>
> = (_SchemaOptionSetters<M> & _SchemaSubSetters<S>) extends infer O 
    ? {
        // Remapping this way to prevent circular references
        [K in NamesOf<O>]: O[K] extends _SchemaSetterRequiringRemap<infer A>
            ? (...args: A) => Schema<M,S>
            : O[K]
    }
    : never

//// Sub Validator Types ////

export type MainValidator<I, O extends I> = ValidatorStruct<I,O>

export interface SubValidator<O> extends ValidatorStruct<O,O> {
    readonly enabled: boolean
}

export type SubValidators<O> = Record<string, SubValidator<O>>

export type SubValidatorsStruct<O> = RecordStruct<string, SubValidator<O>>

export type AnySubValidator = SubValidator<any>

export type AnySubValidators = SubValidators<any>

//// Schema Types ////

export type SchemaSettings<
    M extends AnyValidateStruct,
    S extends SubValidators<ValidateOutput<M>>
> = {
    [$$main]: M
    [$$sub]: S
}
    
export type SchemaValidate<M extends AnyValidate> = 
    M extends Validate<infer I, infer O> 
        ? ValidateStruct<I, O> 
        : ValidateStruct<unknown,unknown> 

/**
 * A schema is comprised of a main validator and an optional
 * number of sub validators.
 */
type Schema<
    M extends AnyValidateStruct,
    S extends SubValidators<ValidateOutput<M>>
> = 
    & SchemaValidate<M>
    & { [$$settings]: SchemaSettings<M,S> }
    & _SchemaSetters<M,S>

// TODO maybe this should be a validator proxy
abstract class SchemaValidator extends ValidatorStruct<unknown,unknown> {

    protected readonly [$$main]: AnyValidateStruct

    protected readonly [$$sub]: SubValidatorsStruct<unknown>

    constructor(main: AnyValidateStruct, sub: Record<string, SubValidator<unknown>>) {
        super()

        this[$$main] = main
        this[$$sub] = new RecordStruct(sub)
    }

    //// Validation ////
    
    validate(input: unknown, options?: ValidateOptions): unknown {
        const ctx = new ValidationContext(input, options)

        let output = ValidateStruct.clone(input)

        // run main validator
        output = this[$$main](output, ctx)

        // run enabled sub validators
        for (const key of keysOf(this[$$sub])) {
            if (this[$$sub][key].enabled)
                output = this[$$sub][key](output, ctx)
        }

        ctx.transformed = output
        if (!ctx.transform && !ValidateStruct.equal(output, input)) {
            throw new ValidationError(
                this[$$main],
                ctx
            )
        }

        return output
    }

    //// State ////

    get [$$settings](): object {
        return pick(this, $$main, $$sub)
    }

}

// Schema

export interface SchemaConstructor {

    new <M extends AnyValidateStruct>(main: M): Schema<M, {}>
    new <M extends AnyValidateStruct, S extends AnySubValidators>(
        main: M,
        sub: S
    ): Schema<M, S>

}

const Schema = class Schema extends SchemaValidator {

    constructor(main: AnyValidateStruct, sub: AnySubValidators) {
        super(main, sub)
        this._createOptionSetters()
        this._createSubValidatorSetters()
    }

    //// Name ////

    override get name(): string {
        return this[$$main]?.name ?? this.constructor.name
    }

    //// Universal Setters ////

    named(name: string): this {
        return this._setMainValidatorOption('name', name)
    }

    message(error: string | ValidationErrorMessage<unknown>): this {

        const validationErrorMethod = isString(error)
            ? () => error 
            : error

        return this._setMainValidatorOption('message', validationErrorMethod)
    }

    //// Helper ////

    private _createOptionSetters(): void {

        const settingsKey = $$settings in this[$$main]
            ? Object.keys(this[$$main][$$settings] as object) as (string | symbol)[]
            : []

        const stateDescriptors = getAllProperties(
            this[$$main],
            (_d, k) => settingsKey.includes(k))

        for (const key in stateDescriptors) {

            const descriptor = stateDescriptors[key]

            const optionSetter = function(this: Schema, value: unknown): object {
                return this._setMainValidatorOption(key, value)
            }

            Property.name(optionSetter, `set${capitalize(key)}`)

            Property.define(
                this,
                key,
                {
                    ...descriptor,
                    enumerable: true,
                    value: optionSetter
                }
            )
        }
    }

    private _createSubValidatorSetters(): void {
        
        for (const key in this[$$sub]) {

            const setter = Property.name(function(this: Schema, ...args: unknown[]) {
                return this._applySubValidator(key, ...args)
            }, `apply${capitalize(key)}` )

            Property.define(this, key, {
                value: setter,
                enumerable: true,
                configurable: true
            })
        }
    }

    private _setMainValidatorOption(key: string | symbol, value: unknown): this {
        return ValidatorStruct.applySettings(
            this, 
            {
                [$$main]: { [key]: value }
            } as ValidateUpdateSettings<this>
        )
    }

    private _applySubValidator(key: string, ...args: unknown[]): this {

        const sub = this[$$sub][key]

        const nextState = 'configure' in sub && isFunc(sub.configure)
            ? sub.configure(...args)
            : args[0]

        return ValidatorStruct.applySettings(
            this,
            {
                [$$sub]: { [key]: nextState }
            } as ValidateUpdateSettings<this>
        )
    }

} as unknown as SchemaConstructor

export default Schema

export {
    Schema
}