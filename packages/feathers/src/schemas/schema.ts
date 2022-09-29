import ajvErrors from 'ajv-errors'
import Ajv from 'ajv'

import {
    schema as feathersSchema,
    Infer,
    JSONSchemaDefinition,

    Schema,
    SchemaWrapper,
    queryProperty,
} from '@feathersjs/schema'

/*** Module State ***/

let ajvWithErrors: Ajv | undefined = undefined

/*** Main ***/

/**
 * Create a @feathers/schema definition. By default, it'll use an instance of AJV that 
 * has errors. 
 * @param input Schema Definition 
 * @param ajv AJV instance
 * @returns SchemaWrapper
 */
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

/**
 * 
 * @param input 
 * @returns 
 */
const useSchemaDefinition = <S extends { definition: { $id: string, async?: boolean } }>(
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
    useSchemaDefinition,
    JSONSchemaDefinition,

    queryProperty,

    Schema,
    SchemaWrapper,
    Infer

}