import {
    NullSchema,
    Schema,
    SchemaOutput,
    UndefinedSchema
} from './schema'

import {
    ShapeSchema,
    ShapeSchemaInput,
    ShapeSchemaOutput
} from './shape-schema'

import {
    ArraySchema,
    ArraySchemaInput,
    ArraySchemaOutput
} from './array-schema'

import {
    TupleSchema,
    TupleSchemaInput,
    TupleSchemaOutput
} from './tuple-schema'

import {
    UnionSchema,
    UnionSchemaInput,
    UnionSchemaOutput
} from './union-schema'

import {
    IntersectionSchema,
    IntersectionSchemaInput,
    IntersectionSchemaOutput
} from './intersection-schema'

import {
    RecordSchema,
    RecordSchemaInput,
    RecordSchemaOutput
} from './record-schema'

import StringSchema from './string-schema'
import NumberSchema from './number-schema'
import BooleanSchema from './boolean-schema'

import {
    isBoolean,
    isInstanceOf,
    isNumber,
    isPlainObject,
    isString
} from '@benzed/is'

/* eslint-disable 
    @typescript-eslint/no-explicit-any
*/

/*** Types ***/

type SchemaInterfaceShortcutSignature = [ShapeSchemaInput] | TupleSchemaInput

type SchemaInterfaceShortcutOuput<T extends SchemaInterfaceShortcutSignature> =
    /**/ T extends TupleSchemaInput
    /**/ ? TupleSchema<T, TupleSchemaOutput<T>>
        /**/ : T extends [ShapeSchemaInput]
        /**/ ? ShapeSchema<T[0], ShapeSchemaOutput<T[0]>>
            /**/ : never

interface SchemaInterface {

    <T extends SchemaInterfaceShortcutSignature>(
        ...input: T
    ): SchemaInterfaceShortcutOuput<T>

    shape<T extends ShapeSchemaInput>(
        input: T
    ): ShapeSchema<T, ShapeSchemaOutput<T>>

    array<T extends ArraySchemaInput>(
        input: T
    ): ArraySchema<T, ArraySchemaOutput<T>>

    record<T extends RecordSchemaInput>(
        input: T
    ): RecordSchema<T, RecordSchemaOutput<T>>

    tuple<T extends TupleSchemaInput>(
        ...input: T
    ): TupleSchema<T, TupleSchemaOutput<T>>

    or<T extends UnionSchemaInput>(
        ...input: T
    ): UnionSchema<T, UnionSchemaOutput<T>>

    and<T extends IntersectionSchemaInput>(
        ...input: T
    ): IntersectionSchema<T, IntersectionSchemaOutput<T>>

    number(): NumberSchema
    string(): StringSchema
    boolean(): BooleanSchema
    null(): NullSchema
    undefined(): UndefinedSchema
}

/*** Helper ***/

function isTupleSchemaInput(args: SchemaInterfaceShortcutSignature): args is TupleSchemaInput {
    return [...args].every(arg =>
        isInstanceOf(arg, Schema) ||
        arg == null ||
        isString(arg) ||
        isNumber(arg) ||
        isBoolean(arg)
    )
}

function isShapeSchemaInput(args: SchemaInterfaceShortcutSignature): args is [ShapeSchemaInput] {
    return args.length === 1 && isPlainObject(args[0])
}

function createSchemaInterface(): SchemaInterface {
    const $: SchemaInterface = <T extends SchemaInterfaceShortcutSignature>(
        ...args: T
    ): SchemaInterfaceShortcutOuput<T> => {

        const schema = isTupleSchemaInput(args)
            ? new TupleSchema(args)
            : isShapeSchemaInput(args)
                ? new ShapeSchema(args[0] as ShapeSchemaInput)
                : null

        if (!schema)
            throw new Error('Input not recognized.')

        return schema as SchemaInterfaceShortcutOuput<T>
    }

    $.shape = shape => new ShapeSchema(shape)
    $.array = of => new ArraySchema(of)
    $.record = of => new RecordSchema(of)

    $.tuple = (...of) => new TupleSchema(of)
    $.or = (...options) => new UnionSchema(options)
    $.and = (...objects) => new IntersectionSchema(objects)

    $.number = () => new NumberSchema()
    $.string = () => new StringSchema()
    $.boolean = () => new BooleanSchema()

    $.null = () => new NullSchema()
    $.undefined = () => new UndefinedSchema()

    return $
}
/*** Main ***/

const $ = createSchemaInterface()

/*** Exports ***/

export default $

export {
    $,
    SchemaOutput,
    SchemaOutput as Infer
}