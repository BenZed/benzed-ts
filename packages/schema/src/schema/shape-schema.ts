import { Compile, Merge } from '@benzed/util'

import { AddFlag, Flags, HasMutable, HasOptional } from './flags'

import Schema, { SchemaOutput } from './schema'

/* eslint-disable 
    @typescript-eslint/no-explicit-any
*/

/*** Types ***/

type IsMutableAndOptional<I, Y, N = never> =
    HasMutable<I, HasOptional<I, Y, N>, N>

type IsMutableNotOptional<I, Y, N = never> =
    HasMutable<I, HasOptional<I, N, Y>, N>

type IsOptionalNotMutable<I, Y, N = never> =
    HasOptional<I, HasMutable<I, N, Y>, N>

type NotMutableNotOptional<I, Y, N = never> =
    HasOptional<I, N, HasMutable<I, N, Y>>

type ShapeSchemaInput = { [key: string]: Schema<any, any, any> }

/* eslint-disable @typescript-eslint/indent */

type ShapeSchemaOutput<T extends ShapeSchemaInput> =
    Compile<
        Merge<[
            { readonly [K in keyof T as NotMutableNotOptional<T[K], K>]: SchemaOutput<T[K]> },
            { readonly [K in keyof T as IsOptionalNotMutable<T[K], K>]?: SchemaOutput<T[K]> },
            { [K in keyof T as IsMutableAndOptional<T[K], K>]?: SchemaOutput<T[K]> },
            { [K in keyof T as IsMutableNotOptional<T[K], K>]: SchemaOutput<T[K]> }
        ]>
    >

/*** Main ***/

class ShapeSchema<
    I extends ShapeSchemaInput,
    O extends ShapeSchemaOutput<I>,
    F extends Flags[] = []
/**/> extends Schema<I, O, F> {

    public override readonly optional!: HasOptional<
    /**/ F, () => never, () => ShapeSchema<I, O, AddFlag<Flags.Optional, F>>
    >

    public override readonly mutable!: HasMutable<
    /**/ F, () => never, () => ShapeSchema<I, O, AddFlag<Flags.Mutable, F>>
    >

    public override readonly clearFlags!: () => ShapeSchema<I, O>

}

/*** Exports ***/

export default ShapeSchema

export {
    ShapeSchema,
    ShapeSchemaInput,
    ShapeSchemaOutput
}
