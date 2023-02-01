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
import { PipeValidatorBuilder } from '../pipe-validator-builder'

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

type _SchemaSetterRequiringRemap<A extends any[]> = (...args: A) => typeof $$schema

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
        : (state: ValidateUpdateState<T>) => typeof $$schema

type _SchemaSetters<
    M extends AnyValidatorStruct, 
    S extends SubValidators<ValidateOutput<M>>
> = (_SchemaMainSetters<M> & _SchemaSubSetters<S>) extends infer O 
    ? {
        // Remapping this way to prevent circular references :(
        [K in KeysOf<O>]: O[K] extends _SchemaSetterRequiringRemap<infer A>
            ? (...args: A) => Schema<M,S>
            : O[K]
    }
    : never

type _SchemaBuilderSetters<
    M extends AnyValidatorStruct, 
    S extends SubValidators<ValidateOutput<M>>
> = (_SchemaMainSetters<M> & _SchemaSubSetters<S>) extends infer O 
    ? {
        // Remapping this way to prevent circular references :(
        [K in KeysOf<O>]: O[K] extends _SchemaSetterRequiringRemap<infer A>
            ? (...args: A) => SchemaBuilder<M,S>
            : O[K]
    }
    : never

type _SchemaBuilder<O> = 
    Pick<
    PipeValidatorBuilder<O,O>,
    'asserts' | 'transforms' | 'validates'
    >

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
    _SchemaSetters<M,S>

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
    SchemaValidate<M> & 
    _SchemaBuilder<ValidateOutput<M>> & 
    _SchemaBuilderSetters<M,S>

// export interface SchemaConstructor {
//     new <I, O extends I, T extends Schematic<I,O>>(
//         ...schematic: T
//     ): Schema<I,O,T>
// }