import { First, Last } from '@benzed/array'
import { NamesOf } from '@benzed/util'

import {
    ValidateInput, 
    ValidateOptions, 
    ValidateOutput
} from '../../../validate'

import { 
    AnyValidateStruct,
} from '../../validate-struct'

import { 
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
    V extends AnyValidateStruct[],
    VA extends AnyValidateStruct[] = V
> = 
    (V extends [infer V1, ...infer Vr]
        ? V1 extends AnyValidateStruct
            ? Vr extends AnyValidateStruct[]
                ? _SchemaOptionSetters<V1> & _SchemaPipeSetters<Vr, VA>
                : _SchemaOptionSetters<V1>
            : {}
        : {}) extends infer O 
        ? {
            // Remapping this way to prevent circular references
            [K in NamesOf<O>]: O[K] extends _SchemaSetterRequiringRemap<infer A>
                ? (...args: A) => PipeSchema<VA>
                : O[K]
        }
        : never

//// Pipe Schema Types ////
    
export type PipeSchemaInput<V extends AnyValidateStruct[]> = 
    First<V> extends AnyValidateStruct
        ? ValidateInput<First<V>>
        : unknown

export type PipeSchemaOutput<V extends AnyValidateStruct[]> = 
    Last<V> extends AnyValidateStruct
        ? ValidateOutput<Last<V>>
        : unknown

export type PipeSchema<
    V extends AnyValidateStruct[],
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