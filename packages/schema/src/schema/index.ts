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

import {
    Constructor,
    isBoolean,
    isFunction,
    isInstanceOf,
    isNumber,
    isPlainObject,
    isString,
    isSymbol
} from '@benzed/is'

import { 
    Compile, 
    TypeGuard 
} from '@benzed/util'

import {
    EnumSchema,
    EnumSchemaInput,
    EnumSchemaOutput
} from './enum'

import DateSchema from './date'

import GenericSchema from './generic'

/* eslint-disable @typescript-eslint/no-explicit-any */

//// Types ////

type SchemaFor<T> = Compile<{ 
    validate: Schema<any,T,any>['validate']
    assert: Schema<any,T,any>['assert']
    is: Schema<any,T,any>['is']
}>

type SchemaInterfaceShortcutSignature =
    [ShapeSchemaInput] | TupleSchemaInput | EnumSchemaInput | [Constructor<unknown>]

type SchemaInterfaceShortcutOuput<T extends SchemaInterfaceShortcutSignature> =
     T extends TupleSchemaInput
         ? TupleSchema<T, TupleSchemaOutput<T>>
         : T extends EnumSchemaInput
             ? EnumSchema<T, EnumSchemaOutput<T>>
             : T extends [ShapeSchemaInput]
                 ? ShapeSchema<T[0], ShapeSchemaOutput<T[0]>>
                 : T extends [Constructor<infer O>]
                     ? GenericSchema<TypeGuard<O>, O>
                     : never

//// Convenience Type Defs ////
     
type UndefinedSchema = EnumSchema<[undefined], undefined>

type NullSchema = EnumSchema<[null], null>

type RegExpSchema = GenericSchema<TypeGuard<RegExp>, RegExp>

type SymbolSchema = GenericSchema<TypeGuard<symbol>, symbol>

type ObjectSchema = RecordSchema<[UnknownSchema], RecordSchemaOutput<[UnknownSchema]>>

type UnknownSchema = GenericSchema<TypeGuard<unknown>, unknown> 

//// Interface ////

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

    number: NumberSchema
    integer: NumberSchema
    string: StringSchema
    boolean: BooleanSchema
    date: DateSchema
    null: NullSchema
    symbol: SymbolSchema
    regexp: RegExpSchema
    undefined: UndefinedSchema
    
    unknown: UnknownSchema

    object: ObjectSchema
    instanceOf<T>(constructor: Constructor<T>): GenericSchema<TypeGuard<T>, T>
    typeOf<T>(guard: TypeGuard<T>): GenericSchema<TypeGuard<T>, T>

    enum<T extends EnumSchemaInput>(
        ...input: T
    ): EnumSchema<T, EnumSchemaOutput<T>>

}

//// Helper ////

function isEnumSchemaInput(args: SchemaInterfaceShortcutSignature): args is EnumSchemaInput {
    return [...args].every(arg =>
        isString(arg) ||
        isNumber(arg) ||
        isBoolean(arg) || 
        arg == null
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

function isConstructorInput(
    args: SchemaInterfaceShortcutSignature
): args is [Constructor<unknown>] {
    return args.length === 1 && isFunction(args[0])
}

function createSchemaInterface(): SchemaInterface {
    const $: SchemaInterface = <T extends SchemaInterfaceShortcutSignature>(
        ...arg: T
    ): SchemaInterfaceShortcutOuput<T> => {

        const schema = isTupleSchemaInput(arg)
            ? new TupleSchema(arg)
            : isEnumSchemaInput(arg)
                ? new EnumSchema(arg)
                : isShapeSchemaInput(arg)
                    ? new ShapeSchema(arg[0] as ShapeSchemaInput)
                    : isConstructorInput(arg)
                        ? $.instanceOf(arg[0])
                        : null

        if (!schema)
            throw new Error(`Input not recognized.`)

        return schema as SchemaInterfaceShortcutOuput<T>
    }

    $.shape = shape => new ShapeSchema(shape)
    $.array = item => new ArraySchema(item)
    $.record = (...keyValue) => new RecordSchema(keyValue)

    $.tuple = (...shape) => new TupleSchema(shape)
    $.or = (...types) => new UnionSchema(types)
    $.and = (...types) => new IntersectionSchema(types)

    $.number = new NumberSchema()
    $.integer = $.number
        .floor(1, `must be an integer`)
        .name(`integer`)

    $.string = new StringSchema()
    $.boolean = new BooleanSchema()
    $.date = new DateSchema()
 
    $.enum = (...values) => new EnumSchema(values)
    $.undefined = $.enum(undefined)
    $.null = $.enum(null)

    $.typeOf = guard => new GenericSchema(guard)
    $.symbol = $.typeOf(isSymbol).name({ name: `symbol`, article: `a` })
    $.unknown = $.typeOf((_): _ is unknown => true)

    $.object = $.record($.unknown)

    $.instanceOf = (constructor) => 
        $.typeOf((instance): instance is any => instance instanceof constructor)
            .name(constructor.name)
    $.regexp = $.instanceOf(RegExp)

    return $
}

function extendSchemaInterface<T extends object, S extends SchemaInterface = SchemaInterface>(
    addedProperties: T,
    $?: S
): S & T {
    return Object.assign($ ?? createSchemaInterface() as S, addedProperties)
}

//// Main ////

const $ = createSchemaInterface()

//// Exports ////

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