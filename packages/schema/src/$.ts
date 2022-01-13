import { Json } from '@benzed/util'
/* eslint-disable @typescript-eslint/indent */

/*** Validator ***/

type Validator<T extends Readonly<Json>> = (input: unknown) => T

/*** Schema ***/
abstract class Schema<T extends Readonly<Json>> {

    public get default(): T {
        // TODO provide default
        return undefined as unknown as T
    }

    public get output(): T {
        return this.default
    }

    public validate: Validator<T> = (input: unknown): T =>
        input as T
}

/*** Primitive Schemas ***/

abstract class PrimitiveSchema<T extends number | boolean | string>
    extends Schema<T> {

    public constructor (
        protected defaultValue?: T
    ) {
        super()
    }

}

class StringSchema<T extends string = string> extends PrimitiveSchema<T> {

}

class NumberSchema<T extends number = number> extends PrimitiveSchema<T> {

}

class BooleanSchema<T extends boolean = boolean> extends PrimitiveSchema<T> {

}

/*** Shape Schema Schemas ***/

class ShapeSchema<T extends { [key: string]: Json }> extends Schema<T> {

    public constructor (input: { [key: string]: SchemaInput }) {
        super()
        void input
    }

}

class ArraySchema<T extends Json> extends Schema<T[]> {

    public constructor (input: SchemaInput) {
        super()
        void input
    }
}

class TupleSchema<T extends readonly Json[]> extends Schema<T> {

    public constructor (...input: readonly SchemaInput[]) {
        super()
        void input
    }

}

class OrSchema<T extends Json> extends Schema<T> {

    public constructor (...input: SchemaInput[]) {
        super()
        void input
    }

}

class AndSchema<T extends Json> extends Schema<T> {
    public constructor (left: SchemaInput, right: SchemaInput) {
        super()
        void left
        void right
    }
}

/***  ***/

type SchemaInput =
    | Schema<Json>
    | { [key: string]: SchemaInput }

type SchemaOutput<T> = T extends Json
    ? T

    : T extends Schema<infer S>
    ? S

    : T extends { [key: string]: unknown }
    ? { [K in keyof T]: SchemaOutput<T[K]> }

    : T extends readonly [...infer A]
    ? { [I in keyof A]: SchemaOutput<A[I]> }

    : T extends Array<infer A>
    ? SchemaOutput<readonly A[]>

    : never

/*** Utility ***/

interface SchemaUtility {

    <T extends { [key: string]: SchemaInput }>(input: T): ShapeSchema<SchemaOutput<T>>

    shape<T extends { [key: string]: SchemaInput }>(input: T): ShapeSchema<SchemaOutput<T>>
    array<T extends SchemaInput>(input: T): ArraySchema<SchemaOutput<T>>
    tuple<T extends readonly SchemaInput[]>(...input: T): TupleSchema<SchemaOutput<T>>

    number<T extends number>(defaultValue?: T): NumberSchema<T>
    string<T extends string>(defaultValue?: T): StringSchema<T>
    boolean<T extends boolean>(defaultValue?: T): BooleanSchema<T>

    or<T extends SchemaInput[]>(...input: T): OrSchema<SchemaOutput<T[number]>>
    and<L extends SchemaInput, R extends SchemaInput>(
        left: L,
        right: R
    ): AndSchema<SchemaOutput<L> & SchemaOutput<R>>
}

const createSchemaUtility = (): SchemaUtility => {

    const $: SchemaUtility = input => new ShapeSchema(input)

    $.shape = input => new ShapeSchema(input)
    $.array = input => new ArraySchema(input)
    $.tuple = (...input) => new TupleSchema(...input)

    $.string = defaultValue => new StringSchema(defaultValue)
    $.number = defaultValue => new NumberSchema(defaultValue)
    $.boolean = defaultValue => new BooleanSchema(defaultValue)

    $.or = (...input) => new OrSchema(...input)
    $.and = (left, right) => new AndSchema(left, right)

    return $
}

const $ = createSchemaUtility()

/* eslint-enable @typescript-eslint/indent */

/*** Exports ***/

export default $

export {
    $,

    StringSchema,
    NumberSchema,
    BooleanSchema,

    ShapeSchema,
    ArraySchema,
    TupleSchema,

    OrSchema,
    AndSchema
}