import { StateKeys } from '@benzed/immutable'
import { KeysOf } from '@benzed/util'

import {
    AnyValidatorStruct,
    ValidatorStruct
} from '../../validator'

import {
    PipeValidatorBuilder,
} from '../pipe-validator-builder'

import {
    Validate, ValidateOutput
} from '../../../validate'

//// EsLint ////

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
*/

//// Sub Validator Types ////

export type MainValidator<I, O extends I> = ValidatorStruct<I,O>

export interface SubValidator<O> extends ValidatorStruct<O, O> {

    /**
     * SubValidators can be disabled.
     */
    readonly enabled: boolean

}

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
    (...args: Parameters<T['apply']>) => typeof $$schema

//// Schema Types ////
    
export type SchemaValidate<M extends AnyValidatorStruct> = 
M extends ValidatorStruct<infer I, infer O> 
    ? Validate<I,O> 
    : Validate<unknown,unknown> 

/**
 * A schematic is a 
 */
export type Schema<
    M extends AnyValidatorStruct, 
    S extends SubValidators<ValidateOutput<M>>
> = 
    SchemaValidate<M> & 
    _SchemaMainSetters<M> & 
    _SchemaSubSetters<S>

export type SchemaBuilder<
    M extends AnyValidatorStruct, 
    S extends SubValidators<ValidateOutput<M>>
> = 
    Schema<M, S> & 
    PipeValidatorBuilder<ValidateOutput<M>, ValidateOutput<M>>

// export interface SchemaConstructor {

//     new <I, O extends I, T extends Schematic<I,O>>(
//         ...schematic: T
//     ): Schema<I,O,T>

// }