import { capitalize } from '@benzed/string'
import { copy, Struct, StructState } from '@benzed/immutable'
import { isFunc, isString, keysOf, KeysOf, Mutable, pick, Property } from '@benzed/util'

import {
    AnyValidate,
    Validate, 
    ValidateOptions, 
    ValidateOutput
} from '../../../validate'

import { 
    $$state,
    AnyValidatorStruct,
    validate,
    ValidatorState,
    ValidatorStruct
} from '../../validator-struct'

import { SubValidator} from './sub-validator'
import { getAllProperties } from './property-helpers'
import { ValidationContext } from '../../../validation-context'
import { MessageMethod } from './simple-sub-validator'
import { ValidationError } from '../../../validation-error'
import { ValidateStruct } from '../../validate-struct'

//// EsLint ////

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
    @typescript-eslint/ban-types,
*/

//// Data ////

const $$schema = Symbol('temp-return-type')
const $$main = Symbol('main-validator')
const $$sub = Symbol('sub-validators')

//// Sub Validator Types ////

export type MainValidator<I, O extends I> = ValidatorStruct<I,O>

export type SubValidators<O> = {
    [key: string]: SubValidator<O>
}

export type AnySubValidators = SubValidators<any>

//// Schema Helper Types ////

/**
 * @internal
 */
export type _StateKeysOf<V extends AnyValidatorStruct> = 
    Extract<'name' | 'message' | 'enabled' | (V extends ValidatorState<infer K> ? KeysOf<K> : never), KeysOf<V>>

/**
 * @internal
 */
export type _ValidatorState<V extends AnyValidatorStruct> = Partial<{
    [K in _StateKeysOf<V>]: V[K]
}>

/**
 * @internal
 */
export type _SchemaSetterRequiringRemap<A extends any[]> = 
    (...args: A) => typeof $$schema

/**
 * @internal
 */
export type _SchemaOptionSetters<T extends AnyValidatorStruct> = {
    [K in _StateKeysOf<T>]: _SchemaOptionSetter<T[K]>
}

type _SchemaOptionSetter<T> = (option: T) => typeof $$schema

type _SchemaSubSetters<S extends AnySubValidators> = {
    [K in KeysOf<S>]: _SchemaSubSetter<S[K]>
}

type _SchemaSubSetter<T extends AnyValidatorStruct> = 
    T extends { configure: (...args: infer A) => T }

        // If the sub valiator defines a configuration signature, 
        // the setter will use that signature
        ? (...args: A) => typeof $$schema

        // otherwise it will accept a state object
        : (state: _ValidatorState<T>) => typeof $$schema

export type _SchemaSetters<
    M extends AnyValidatorStruct, 
    S extends SubValidators<ValidateOutput<M>>
> = (_SchemaOptionSetters<M> & _SchemaSubSetters<S>) extends infer O 
    ? {
        // Remapping this way to prevent circular references
        [K in KeysOf<O>]: O[K] extends _SchemaSetterRequiringRemap<infer A>
            ? (...args: A) => Schema<M,S>
            : O[K]
    }
    : never

//// Schema Types ////
    
export type SchemaValidate<M extends AnyValidate> = 
    M extends Validate<infer I, infer O> 
        ? ValidatorStruct<I, O> 
        : ValidatorStruct<unknown,unknown> 

/**
 * A schema is comprised of a main validator and an optional
 * number of sub validators.
 */
type Schema<
    M extends AnyValidatorStruct,
    S extends SubValidators<ValidateOutput<M>>
> = 
    SchemaValidate<M> & _SchemaSetters<M,S>

// Schema Validator

class SchemaValidator extends ValidateStruct<unknown,unknown> {

    readonly [$$main]: AnyValidatorStruct

    readonly [$$sub]: AnySubValidators

    constructor(main: AnyValidatorStruct, sub: AnySubValidators = {}) {
        super(validate)

        this[$$main] = main
        this[$$sub] = sub
    }

    validate(input: unknown, options?: ValidateOptions): unknown {
        const ctx = new ValidationContext(input, options)

        let output = copy(input)

        // run main validator
        output = this[$$main](output, ctx)

        // run enabled sub validators
        for (const key of keysOf(this[$$sub])) {
            if (this[$$sub][key].enabled)
                output = this[$$sub][key](output, ctx)
        }

        // valid?
        ctx.transformed = output 
        if (!ctx.transform && !this[$$main].equal(output, input))
            throw new ValidationError('Validation failed.', ctx)

        return output
    }

    get [$$state](): Pick<this, typeof $$main | typeof $$sub> {
        return {
            [$$main]: this[$$main],
            [$$sub]: this[$$sub]
        }
    }

    set [$$state](state: Pick<this, typeof $$main | typeof $$sub>) {

        const that = this as Mutable<this>

        that[$$sub] = state[$$sub]
        that[$$main] = state[$$main]
    }

}

// Schema

export interface SchemaConstructor extends SchemaValidator {

    new <M extends AnyValidatorStruct>(main: M): Schema<M, {}>
    new <M extends AnyValidatorStruct, S extends AnySubValidators>(
        main: M,
        sub: S
    ): Schema<M, S>

}

const Schema = class Schema extends SchemaValidator {

    constructor(main: AnyValidatorStruct, sub: AnySubValidators) {
        super(main, sub)
        this._createOptionSetters()
        this._createSubValidatorSetters()
    }

    //// Name ////
    
    override get name(): string {
        return this[$$main].name
    }

    //// Universal Setters ////
    
    named(name: string): this {
        return this._setMainValidatorOption('name', name)
    }

    message(error: string | MessageMethod<unknown>): this {

        const errorMethod = isString(error)
            ? () => error 
            : error

        return this._setMainValidatorOption('message', errorMethod)
    }

    //// Helper ////
    
    private _createOptionSetters(): void {

        const stateKeys = $$state in this[$$main]
            ? Object.keys(this[$$main][$$state] as object) as (string | symbol)[]
            : []

        const stateDescriptors = getAllProperties(
            this[$$main], 
            (_d, k) => stateKeys.includes(k))

        for (const key in stateDescriptors) {

            const descriptor = stateDescriptors[key]

            const setter = Property.name(function(this: Schema, value: unknown) {
                return this._setMainValidatorOption(key, value)
            }, `set${capitalize(key)}` )

            Property.define(this, key, {
                ...descriptor,
                enumerable: true,
                value: setter
            })
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

        const newMainState = { ...this[$$main], [key]: value }
        const newMain = ValidatorStruct.applyState(this[$$main], newMainState)

        return this._applyState({
            [$$main]: newMain
        })
    }

    private _applySubValidator(key: string, ...args: unknown[]): this {

        const sub = this[$$sub][key]

        const nextSub = 'configure' in sub && isFunc(sub.configure)
            ? sub.configure(...args)
            : ValidatorStruct.applyState(sub, args[0] as StructState<typeof sub>)

        if (nextSub?.constructor !== sub.constructor)
            throw new Error('Invalid configure method implementation.')

        const newSub = { ...this[$$sub], [key]: nextSub }

        return this._applyState({ [$$sub]: newSub })
    }

    private _applyState(state: Partial<Pick<this, typeof $$main | typeof $$sub>>): this {

        const newState = { ...this[$$state], ...state } as unknown as StructState<this>

        const newThis = ValidatorStruct.applyState(
            this,
            newState
        )

        return newThis
    }

} as unknown as SchemaConstructor

export default Schema

export {
    Schema
}