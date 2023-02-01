import { StateKeys } from '@benzed/immutable'

import { KeysOf } from '@benzed/util'

import {
    PipeValidator,
} from '../pipe-validator'

import {
    Validate, 
    ValidateOutput
} from '../../../validate'

import { 
    AnyValidatorStruct,
    ValidatorStruct
} from '../../validator-struct'

import { ValidateState } from '../../validate-struct'

import { SubValidator, SubValidatorConfigure } from './sub-validator'

//// EsLint ////

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
*/

//// Sub Validator Types ////

export type MainValidator<I, O extends I> = ValidatorStruct<I,O>

export type SubValidators<O> = {
    [key: string]: SubValidator<O>
}

export type AnySubValidators = SubValidators<any>

//// Schema Helper Types ////

const $$schema = Symbol('temp-return-type')

type _SchemaMainSetters<T extends AnyValidatorStruct> = {
    [K in StateKeys<T>]: _SchemaMainOptionSetter<T[K]>
}

type _SchemaMainOptionSetter<T> = (option: T) => typeof $$schema

type _SchemaSubSetters<S extends AnySubValidators> = {
    [K in KeysOf<S>]: _SchemaSubSetter<S[K]>
}

type _SchemaSubSetter<T extends AnyValidatorStruct> = 
    T extends SubValidatorConfigure<ValidateOutput<T>>

        // If the sub valiator defines a configuration signature, 
        // the setter will use that signature
        ? (...args: Parameters<T['configure']>) => typeof $$schema
        
        // otherwise it will accept a state object
        : (state: ValidateState<T>) => typeof $$schema

//// Schema Types ////
    
export type SchemaValidate<M extends AnyValidatorStruct> = 
M extends ValidatorStruct<infer I, infer O> 
    ? Validate<I,O> 
    : Validate<unknown,unknown> 

/**
 * A schema is comprised of a main validator and an optional
 * number of sub validators. 
 * 
 * It creates setter methods to update the configuration of
 * these validators immutably.
 */
export type Schema<
    M extends AnyValidatorStruct, 
    S extends SubValidators<ValidateOutput<M>>
> = 
    SchemaValidate<M> & 
    _SchemaMainSetters<M> & 
    _SchemaSubSetters<S>

type _SchemaBuilder<O> = 
    Pick<
    PipeValidator<O,O>,
    'asserts' | 'transforms' | 'validates'
    >

/**
 * A schema builder is a schema that also has a pipe builder
 * interface.
 * 
 * This would be the primary class
 */
export type SchemaBuilder<
    M extends AnyValidatorStruct, 
    S extends SubValidators<ValidateOutput<M>>
> = 
    Schema<M, S> &
    _SchemaBuilder<ValidateOutput<M>>

// export interface SchemaConstructor {

//     new <I, O extends I, T extends Schematic<I,O>>(
//         ...schematic: T
//     ): Schema<I,O,T>

// }