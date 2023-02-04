import { First, Last } from '@benzed/array'
import { KeysOf } from '@benzed/util'

import {
    ValidateInput, 
    ValidateOptions, 
    ValidateOutput
} from '../../../validate'

import { 
    AnyValidatorStruct,
    ValidatorStruct
} from '../../validator-struct'

import {
    _SchemaOptionSetters,
    _SchemaSetterRequiringRemap
} from './schema'

//// EsLint ////

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
    @typescript-eslint/ban-types,
*/

//// Schema Helper Types ////

type _SchemaPipeSetters<
    V extends AnyValidatorStruct[],
    VA extends AnyValidatorStruct[] = V
> = 
    (V extends [infer V1, ...infer Vr]
        ? V1 extends AnyValidatorStruct
            ? Vr extends AnyValidatorStruct[]
                ? _SchemaOptionSetters<V1> & _SchemaPipeSetters<Vr, VA>
                : _SchemaOptionSetters<V1>
            : {}
        : {}) extends infer O 
        ? {
            // Remapping this way to prevent circular references
            [K in KeysOf<O>]: O[K] extends _SchemaSetterRequiringRemap<infer A>
                ? (...args: A) => PipeSchema<VA>
                : O[K]
        }
        : never

//// Pipe Schema Types ////
    
export type PipeSchemaInput<V extends AnyValidatorStruct[]> = 
    First<V> extends AnyValidatorStruct
        ? ValidateInput<First<V>>
        : unknown

export type PipeSchemaOutput<V extends AnyValidatorStruct[]> = 
    Last<V> extends AnyValidatorStruct
        ? ValidateOutput<Last<V>>
        : unknown

export type PipeSchema<
    V extends AnyValidatorStruct[],
> = 
    ((input: PipeSchemaInput<V>, options?: ValidateOptions) => PipeSchemaOutput<V>) & 
    _SchemaPipeSetters<V> & 
    {
        to<
            Ox extends PipeSchemaOutput<V>, 
            Vx extends ValidatorStruct<PipeSchemaOutput<V>, Ox>
        >(next: Vx): PipeSchema<[...V, Vx]>
    }

//// Implementation ////

// TODO