import { StateKeys } from '@benzed/immutable'
import { KeysOf } from '@benzed/util'

import {
    Validate, 
    ValidateOutput
} from '../../../validate'

import { 
    AnyValidatorStruct,
    ValidatorStruct
} from '../../validator-struct'

import { ValidateUpdateState } from '../../validate-struct'
import { SubValidator, SubValidatorConfigure } from './sub-validator'

//// EsLint ////

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
    @typescript-eslint/ban-types,
*/

//// Data ////

const $$schema = Symbol('temp-return-type')

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
    
export type SchemaValidate<M extends AnyValidatorStruct> = 
    M extends ValidatorStruct<infer I, infer O> 
        ? Validate<I,O> 
        : Validate<unknown,unknown> 

/**
 * A schema is comprised of a main validator and an optional
 * number of sub validators.
 */
export type Schema<
    M extends AnyValidatorStruct,
    S extends SubValidators<ValidateOutput<M>>
> = 
    SchemaValidate<M> & _SchemaSetters<M,S>