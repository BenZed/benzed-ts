import { Compile } from '@benzed/util'

import type {
    Schema,
    SchemaOutput
} from './schema'

import type {
    ShapeSchema,
    ShapeSchemaInput,
    ShapeSchemaOutput
} from './shape-schema'

import StringSchema from './string-schema'
import NumberSchema from './number-schema'

/* eslint-disable 
    @typescript-eslint/no-explicit-any
*/

/*** Types ***/

type Infer<T extends Schema<any, any>> = Compile<SchemaOutput<T>>

interface SchemaInterface {

    <T extends ShapeSchemaInput>(
        input: T
    ): ShapeSchema<ShapeSchemaOutput<T>, []>

    shape<T extends ShapeSchemaInput>(
        input: T
    ): ShapeSchema<ShapeSchemaOutput<T>, []>

    number(): NumberSchema<[]>

    string(): StringSchema<[]>

}

/*** Main ***/

const $: SchemaInterface = null as unknown as SchemaInterface

/*** Exports ***/

export default $

export { $, Infer }