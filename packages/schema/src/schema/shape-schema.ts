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

type Shape = { [key: string]: any }

type ShapeSchemaInput = { [key: string]: Schema<any, any> }

type ShapeSchemaOutput<T extends ShapeSchemaInput> =
    Compile<Merge<[
        { readonly [K in keyof T as NotMutableNotOptional<T[K], K>]: SchemaOutput<T[K]> },
        { readonly [K in keyof T as IsOptionalNotMutable<T[K], K>]?: SchemaOutput<T[K]> },
        { [K in keyof T as IsMutableAndOptional<T[K], K>]?: SchemaOutput<T[K]> },
        { [K in keyof T as IsMutableNotOptional<T[K], K>]: SchemaOutput<T[K]> }
    ]>>

/*** Main ***/

class ShapeSchema<T extends Shape, F extends Flags[] = []> extends Schema<T, F> {

    private readonly _input: ShapeSchemaInput

    public constructor (input: ShapeSchemaInput, ...flags: F) {
        super(...flags)
        this._input = input
    }

    public override readonly optional!: HasOptional<
    /**/ F, () => never, () => ShapeSchema<T, AddFlag<Flags.Optional, F>>
    >

    public override readonly mutable!: HasMutable<
    /**/ F, () => never, () => ShapeSchema<T, AddFlag<Flags.Mutable, F>>
    >

    public override readonly clearFlags!: () => ShapeSchema<T>

}

/*** Exports ***/

export default ShapeSchema

export {
    ShapeSchema,
    ShapeSchemaInput,
    ShapeSchemaOutput
}
