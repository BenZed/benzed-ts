import { Json } from '@benzed/util'

/*** Validator ***/

type Validator<T extends Json> = (input: unknown) => T

/*** Schema ***/

abstract class Schema<T> {

    private readonly _validators: Validator<SchemaOutput<T>>[] = []

    public get output(): SchemaOutput<T> {
        return this.default
    }

    // TODO this should return a default value
    public get default(): SchemaOutput<T> {
        return null as unknown as SchemaOutput<T>
    }

    public validate: Validator<SchemaOutput<T>> = (input: unknown): SchemaOutput<T> => {
        const { _validators: validators } = this

        let output = input as SchemaOutput<T>
        for (const validator of validators)
            output = validator(output)

        return output
    }
}

abstract class PrimitiveSchema<T extends number | string | boolean> extends Schema<T> {
    public constructor (defaultValue?: T | (() => T)) {
        super()
        void defaultValue
    }
}

class NumberSchema<T extends number = number> extends PrimitiveSchema<T> { }

class StringSchema<T extends string = string> extends PrimitiveSchema<T> { }

class BooleanScheam<T extends boolean = boolean> extends PrimitiveSchema<T> { }

type ArraySchemaInput = Schema<Json> | { [key: string]: ArraySchemaInput | [ArraySchemaInput] }
class ArraySchema<T extends ArraySchemaInput>
    extends Schema<T[]> {

    public constructor (of: T) {
        super()
        void of
    }
}

type ShapeSchemaInput = {
    [key: string]: Schema<Json> | [Schema<Json>] | ShapeSchemaInput | [ShapeSchemaInput]
}
class ShapeSchema<T extends ShapeSchemaInput>
    extends Schema<T>{

    public constructor (shape: T) {
        super()
        void shape
    }
}

type OrSchemaInput = (
    Schema<Json> | ArraySchemaInput | [ArraySchemaInput] | ShapeSchemaInput
)[]
class OrSchema<T> extends Schema<T> {
    public constructor (...schemas: OrSchemaInput) {
        super()
        void schemas
    }
}

/*** Util ***/

interface SchemaUtility {

    <T extends ShapeSchemaInput>(shape: T): ShapeSchema<T>

    shape<T extends ShapeSchemaInput>(shape: T): ShapeSchema<T>

    string<T extends string>(defaultValue?: T): StringSchema<T>
    boolean<T extends boolean>(defaultValue?: T): BooleanScheam<T>
    number<T extends number>(defaultValue?: T): NumberSchema<T>

    array<T extends ArraySchemaInput>(schema: T): ArraySchema<T>

    or<T extends OrSchemaInput>(...schemas: T): OrSchema<T[number]>
    // enum()
}

/* eslint-disable @typescript-eslint/indent */

type SchemaOutput<T> = T extends Schema<infer U>
    ? SchemaOutput<U>

    : T extends Array<infer U>
    ? SchemaOutput<U>[]

    : T extends { [key: string]: unknown }
    ? { [K in keyof T]: SchemaOutput<T[K]> }

    : T extends Json
    ? T

    : never

/* eslint-enable @typescript-eslint/indent */

const createValidatorUtility = (): SchemaUtility => {

    const $: SchemaUtility = shape => new ShapeSchema(shape)

    $.shape = shape => new ShapeSchema(shape)
    $.array = shape => new ArraySchema(shape)
    $.string = <T extends string>(defaultValue?: T) => new StringSchema<T>(defaultValue)
    $.number = <T extends number>(defaultValue?: T) => new NumberSchema<T>(defaultValue)
    $.boolean = <T extends boolean>(defaultValue?: T) => new BooleanScheam<T>(defaultValue)
    $.or = (...schemas: OrSchemaInput) => new OrSchema(...schemas)

    return $
}

const $ = createValidatorUtility()

/*** Exports ***/

export default $

export {
    $,

    Validator,
    SchemaOutput,

    Schema,
    StringSchema,
    NumberSchema,
    BooleanScheam,
    ArraySchema,
    ShapeSchema,

    OrSchema,
}
