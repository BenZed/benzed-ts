import ajvErrors from 'ajv-errors'
import Ajv from 'ajv'

import {
    schema as feathersSchema,
    Infer,
    JSONSchemaDefinition,
    queryProperty,
} from '@feathersjs/schema'

/*** Module State ***/

const ajvWithErrors = ajvErrors(
    new Ajv({
        coerceTypes: true,
        allErrors: true,
        allowUnionTypes: true,
        removeAdditional: true
    })
)

/*** Main ***/

const schema = <S extends JSONSchemaDefinition>(input: S) =>
    feathersSchema(input, ajvWithErrors)

const schemaDefinition = <S extends { definition: { $id: string, async?: boolean } }>(
    input: S
): Omit<S['definition'], '$id' | 'async'> => {

    const { $id, async, ...output } = input.definition
    void $id
    void async

    return output as Omit<S['definition'], '$id' | 'async'>
}

/*** Exports ***/

export default schema

export {
    schema,
    schemaDefinition,

    queryProperty,

    Infer,
    JSONSchemaDefinition,
}