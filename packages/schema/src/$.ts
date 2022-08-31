
import {
    SchemaInput,
    SchemaOutput,

    StringSchema,
    NumberSchema,
    BooleanSchema,

    ShapeSchema,
    ArraySchema,
    TupleSchema,

    OrSchema,
    AndSchema,
    Intersect

} from './schema'

/* eslint-disable @typescript-eslint/indent */

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
    and<T extends SchemaInput[]>(
        ...input: T
    ): AndSchema<Intersect<SchemaOutput<T>>>
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
    $.and = (...input) => new AndSchema(...input)

    return $
}

const $ = createSchemaUtility()

/* eslint-enable @typescript-eslint/indent */

/*** Exports ***/

export default $

export {
    $
}