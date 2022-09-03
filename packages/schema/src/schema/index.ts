import {
    Schema,
    SchemaOutput
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
import { isInstanceOf, isNumber, isPlainObject, isString } from '@benzed/is/lib'

/* eslint-disable 
    @typescript-eslint/no-explicit-any
*/

/*** Types ***/

type SchemaInterfaceShortcutSignature = [ShapeSchemaInput] | TupleSchemaInput | UnionSchemaInput

type SchemaInterfaceShortcutOuput<T extends SchemaInterfaceShortcutSignature> =
 /**/ T extends TupleSchemaInput
 /**/ ? TupleSchema<TupleSchemaOutput<T>>

 /*    */ : T extends UnionSchemaInput
     /**/ ? UnionSchema<UnionSchemaOutput<T>>

     /*    */ : T extends [ShapeSchemaInput]
         /**/ ? ShapeSchema<ShapeSchemaOutput<T[0]>>

         /**/ : never

interface SchemaInterface {

    <T extends SchemaInterfaceShortcutSignature>(
        ...input: T
    ): SchemaInterfaceShortcutOuput<T>

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

/*** Helper ***/

function isTupleSchemaInput(args: SchemaInterfaceShortcutSignature): args is TupleSchemaInput {
    return [...args].every(arg => isInstanceOf(arg, Schema))
}

function isUnionSchemaInput(args: SchemaInterfaceShortcutSignature): args is UnionSchemaInput {
    return [...args].some(arg => isString(arg) || isNumber(arg))
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
            : isUnionSchemaInput(args)
                ? new UnionSchema(args)
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