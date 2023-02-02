import { $$copy, copy, StateKeys } from '@benzed/immutable'
import { assign, isString, keysOf, KeysOf, Property } from '@benzed/util'

import {
    AnyValidate,
    Validate, 
    ValidateOptions, 
    ValidateOutput
} from '../../../validate'

import { 
    AnyValidatorStruct,
    ValidatorStruct
} from '../../validator-struct'

import { SubValidator, SubValidatorConfigure } from './sub-validator'
import { ValidationContext } from '../../../validation-context'
import { ValidationError } from '../../../validation-error'
import { ValidateUpdateState } from '../../validate-struct'
import { getAllProperties, hideProperty } from './property-helpers'
import { ValidateErrorMethod } from './simple-sub-validator'

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
export type _SchemaSetterRequiringRemap<A extends any[]> = (...args: A) => typeof $$schema

/**
 * @internal
 */
export type _SchemaOptionSetters<T extends AnyValidatorStruct> = {
    [K in StateKeys<T>]: _SchemaOptionSetter<T[K]>
}

type _SchemaOptionSetter<T> = (option: T) => typeof $$schema

type _SchemaSubSetters<S extends AnySubValidators> = {
    [K in KeysOf<S>]: _SchemaSubSetter<S[K]>
}

type _SchemaSubSetter<T extends AnyValidatorStruct> = 
    T extends SubValidatorConfigure<ValidateOutput<T>>

        // If the sub valiator defines a configuration signature, 
        // the setter will use that signature
        ? (...args: Parameters<T['configure']>) => typeof $$schema
        
        // otherwise it will accept a state object
        : (state: ValidateUpdateState<T>) => typeof $$schema

type _SchemaSetters<
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

class SchemaValidator extends ValidatorStruct<unknown,unknown> {

    readonly [$$main]: AnyValidatorStruct

    readonly [$$sub]: AnySubValidators

    constructor(main: AnyValidatorStruct, sub: AnySubValidators = {}) {
        super()

        this[$$main] = main
        hideProperty(this, $$main)

        this[$$sub] = sub
        hideProperty(this, $$sub)
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

        ctx.transformed = output 
        if (!ctx.transform && !this.equal(output, input))
            throw new ValidationError('Validation failed.', ctx)

        return output
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

    //// Universal ////
    
    named(name: string): this {
        return this._setMainValidatorOption('name', name)
    }

    error(error: string | ValidateErrorMethod): this {

        const errorMethod = isString(error)
            ? () => error 
            : error

        return this._setMainValidatorOption('error', errorMethod)
    }

    //// Helper ////
    
    private _createOptionSetters(): void {

        const allEnumerable = getAllProperties(
            this[$$main], 
            (d, k) => !!d.enumerable && 
                !(k in this) && 
                k !== 'name' && 
                k !== 'error'
        )

        console.log(allEnumerable)

        for (const key in allEnumerable) {

            const descriptor = allEnumerable[key]

            Property.define(this, key, {
                ...descriptor,
                value(this: Schema, value: unknown) {
                    return this._setMainValidatorOption(key, value)
                } 
            })
        }

    }

    private _createSubValidatorSetters(): void {
        //
    }

    private _setMainValidatorOption(key: string | symbol, value: unknown): this {
        const main = ValidatorStruct.apply(this[$$main], { [key]: value })

        const clone = this[$$copy]()
        return assign(clone, { [$$main]: main }) as this
    }

} as unknown as SchemaConstructor

export default Schema

export {
    Schema
}