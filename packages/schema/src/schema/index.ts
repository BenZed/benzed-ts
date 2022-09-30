import {
    Schema,
    SchemaOutput,
} from './schema'

import {
    ShapeSchema,
    ShapeSchemaInput,
    ShapeSchemaOutput
} from './shape'

import {
    ArraySchema,
    ArraySchemaInput,
    ArraySchemaOutput
} from './array'

import {
    TupleSchema,
    TupleSchemaInput,
    TupleSchemaOutput
} from './tuple'

import {
    UnionSchema,
    UnionSchemaInput,
    UnionSchemaOutput
} from './union'

import {
    IntersectionSchema,
    IntersectionSchemaInput,
    IntersectionSchemaOutput
} from './intersection'

import {
    RecordSchema,
    RecordSchemaInput,
    RecordSchemaOutput
} from './record'

import StringSchema from './string'
import NumberSchema from './number'
import BooleanSchema from './boolean'
import NullSchema from './null'
import UndefinedSchema from './undefined'

import {
    isBoolean,
    isInstanceOf,
    isNumber,
    isPlainObject,
    isString
} from '@benzed/is'

import {
    EnumSchema,
    EnumSchemaInput,
    EnumSchemaOutput
} from './enum'
import DateSchema from './date'

/* eslint-disable @typescript-eslint/no-explicit-any */

/*** Types ***/

type SchemaFor<T> = Schema<any, T, any>

type SchemaInterfaceShortcutSignature =
    [ShapeSchemaInput] | TupleSchemaInput | EnumSchemaInput

type SchemaInterfaceShortcutOuput<T extends SchemaInterfaceShortcutSignature> =
    /**/ T extends TupleSchemaInput
    /**/ ? TupleSchema<T, TupleSchemaOutput<T>>
        /**/ : T extends EnumSchemaInput
        /**/ ? EnumSchema<T, EnumSchemaOutput<T>>
        /*  */ : T extends [ShapeSchemaInput]
            /**/ ? ShapeSchema<T[0], ShapeSchemaOutput<T[0]>>
            /*    */ : never

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
        ...input: T
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

    number(def?: number): NumberSchema
    string(def?: string): StringSchema
    boolean(def?: boolean): BooleanSchema
    date(def?: Date): DateSchema
    null(): NullSchema
    undefined(): UndefinedSchema

    enum<T extends EnumSchemaInput>(
        ...input: T
    ): EnumSchema<T, EnumSchemaOutput<T>>

}

/*** Helper ***/

function isEnumSchemaInput(args: SchemaInterfaceShortcutSignature): args is EnumSchemaInput {
    return [...args].every(arg =>
        isString(arg) ||
        isNumber(arg) ||
        isBoolean(arg)
    )
}

function isTupleSchemaInput(args: SchemaInterfaceShortcutSignature): args is TupleSchemaInput {
    return [...args].every(arg =>
        isInstanceOf(arg, Schema)
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
            : isEnumSchemaInput(args)
                ? new EnumSchema(args)
                : isShapeSchemaInput(args)
                    ? new ShapeSchema(args[0] as ShapeSchemaInput)
                    : null

        if (!schema)
            throw new Error('Input not recognized.')

        return schema as SchemaInterfaceShortcutOuput<T>
    }

    $.shape = shape => new ShapeSchema(shape)
    $.array = item => new ArraySchema(item)
    $.record = (...keyValue) => new RecordSchema(keyValue)

    $.tuple = (...shape) => new TupleSchema(shape)
    $.or = (...types) => new UnionSchema(types)
    $.and = (...types) => new IntersectionSchema(types)

    $.number = (def?: number) => new NumberSchema(def)
    $.string = (def?: string) => new StringSchema(def)
    $.boolean = (def?: boolean) => new BooleanSchema(def)
    $.date = (def?: Date) => new DateSchema(def)

    $.null = () => new NullSchema()
    $.undefined = () => new UndefinedSchema()

    $.enum = (...values) => new EnumSchema(values)

    return $
}

function extendSchemaInterface<T extends object, S extends SchemaInterface = SchemaInterface>(
    addedProperties: T,
    $?: S
): S & T {
    return Object.assign($ ?? createSchemaInterface() as S, addedProperties)
}

/*** Main ***/

const $ = createSchemaInterface()

/*** Exports ***/

export default $

export {
    $,
    Schema,
    SchemaFor,
    SchemaOutput,
    SchemaOutput as Infer,

    SchemaInterface,
    createSchemaInterface,
    extendSchemaInterface,
}