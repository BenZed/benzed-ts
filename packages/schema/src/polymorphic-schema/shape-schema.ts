import { Merge } from '@benzed/util'

import { Flags, HasReadonly, HasOptional } from './flags'

import Schema, { SchemaOutput } from './schema'

/* eslint-disable 
    @typescript-eslint/no-explicit-any
*/

/*** Types ***/

type IsReadonlyAndOptional<I, Y, N = never> =
    HasReadonly<I, HasOptional<I, Y, N>, N>

type IsReadonlyNotOptional<I, Y, N = never> =
    HasReadonly<I, HasOptional<I, N, Y>, N>

type IsOptionalNotReadonly<I, Y, N = never> =
    HasOptional<I, HasReadonly<I, N, Y>, N>

type NotOptionalNotReadonly<I, Y, N = never> =
    HasOptional<I, N, HasReadonly<I, N, Y>>

type ShapeSchemaInput = { [key: string]: Schema<any, any> }

type ShapeSchemaOutput<T extends ShapeSchemaInput> =
    Merge<[
        { readonly [K in keyof T as IsReadonlyNotOptional<T[K], K>]: SchemaOutput<T[K]> },
        { readonly [K in keyof T as IsReadonlyAndOptional<T[K], K>]?: SchemaOutput<T[K]> },
        { [K in keyof T as IsOptionalNotReadonly<T[K], K>]?: SchemaOutput<T[K]> },
        { [K in keyof T as NotOptionalNotReadonly<T[K], K>]: SchemaOutput<T[K]> }
    ]>

/*** Main ***/

class ShapeSchema<T, F extends Flags[]> extends Schema<T, F> {

    public override readonly optional!: HasOptional<
    /**/ F, never, () => ShapeSchema<T, [...F, Flags.Optional]>
    >

    public override readonly readonly!: HasReadonly<
    /**/ F, never, () => ShapeSchema<T, [...F, Flags.Readonly]>
    >
}

/*** Exports ***/

export default ShapeSchema

export {
    ShapeSchema,
    ShapeSchemaInput,
    ShapeSchemaOutput
}
