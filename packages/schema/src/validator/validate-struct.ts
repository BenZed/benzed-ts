import { CallableStruct, Struct, StructState } from '@benzed/immutable'

import { Validate } from '../validate'

//// EsLint ////

/* eslint-disable
    @typescript-eslint/no-explicit-any
*/

//// ValidateStruct ////

/**
 * Transferrable immutable state base class for any method that validates.
 */
export abstract class ValidateStruct<I, O extends I = I> 
    extends CallableStruct<Validate<I,O>> implements Struct { }

export type AnyValidateStruct = ValidateStruct<any,any>

export type ValidateState<V extends AnyValidateStruct> = StructState<Omit<V, 'equal' | 'validate'>>

export type ValidateUpdateState<V extends AnyValidateStruct> = Partial<ValidateState<V>>
