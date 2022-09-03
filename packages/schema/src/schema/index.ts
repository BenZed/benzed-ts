import type {
    SchemaOutput
} from './schema'

import type {
    ShapeSchema,
    ShapeSchemaInput,
    ShapeSchemaOutput
} from './shape-schema'

import type {
    ArraySchema,
    ArraySchemaInput,
    ArraySchemaOutput
} from './array-schema'

import type {
    TupleSchema,
    TupleSchemaInput,
    TupleSchemaOutput
} from './tuple-schema'

import type {
    UnionSchema,
    UnionSchemaInput,
    UnionSchemaOutput
} from './union-schema'

import type {
    IntersectionSchema,
    IntersectionSchemaInput,
    IntersectionSchemaOutput
} from './intersection-schema'

import type {
    RecordSchema,
    RecordSchemaInput,
    RecordSchemaOutput
} from './record-schema'

import type StringSchema from './string-schema'
import type NumberSchema from './number-schema'
import type BooleanSchema from './boolean-schema'

/* eslint-disable 
    @typescript-eslint/no-explicit-any
*/

/*** Types ***/

interface SchemaInterface {

    <T extends [ShapeSchemaInput] | TupleSchemaInput | UnionSchemaInput>(
        ...input: T
    )
    /**/: T extends TupleSchemaInput
    /**/ ? TupleSchema<TupleSchemaOutput<T>>

        /**/ : T extends UnionSchemaInput
        /**/ ? TupleSchema<UnionSchemaOutput<T>>

            /**/ : T extends [ShapeSchemaInput]
            /**/ ? ShapeSchema<ShapeSchemaOutput<T[0]>>

                /**/ : unknown

    shape<T extends ShapeSchemaInput>(
        input: T
    ): ShapeSchema<ShapeSchemaOutput<T>>

    array<T extends ArraySchemaInput>(
        input: T
    ): ArraySchema<ArraySchemaOutput<T>>

    record<T extends RecordSchemaInput>(
        input: T
    ): RecordSchema<RecordSchemaOutput<T>>

    tuple<T extends TupleSchemaInput>(
        ...input: T
    ): TupleSchema<TupleSchemaOutput<T>>

    or<T extends UnionSchemaInput>(
        ...input: T
    ): UnionSchema<UnionSchemaOutput<T>>

    and<T extends IntersectionSchemaInput>(
        ...input: T
    ): IntersectionSchema<IntersectionSchemaOutput<T>>

    number(): NumberSchema
    string(): StringSchema
    boolean(): BooleanSchema

}

/*** Main ***/

const $: SchemaInterface = null as unknown as SchemaInterface

/*** Exports ***/

export default $

export {
    $,
    SchemaOutput,
    SchemaOutput as Infer
}