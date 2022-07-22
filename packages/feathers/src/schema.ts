import ajvErrors from 'ajv-errors'
import Ajv from 'ajv'

import {
    schema as feathersSchema,
    Infer,
    JSONSchemaDefinition,
    queryProperty,
} from '@feathersjs/schema'

/*** Module State ***/

let ajvWithErrors: Ajv | undefined = undefined

/*** Main ***/

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const schema = <S extends JSONSchemaDefinition>(input: S, ajv?: Ajv) => {

    if (!ajv && !ajvWithErrors) {
        ajvWithErrors = ajvErrors(new Ajv({
            coerceTypes: true,
            allErrors: true,
            allowUnionTypes: true,
            removeAdditional: true
        }))
    }

    if (!ajv)
        ajv = ajvWithErrors

    return feathersSchema(input, ajv)
}

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