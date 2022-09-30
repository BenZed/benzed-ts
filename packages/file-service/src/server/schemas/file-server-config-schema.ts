import {
    Infer,
    mongoDBApplicationConfigSchema,
    schema
} from '@benzed/feathers'

/*** Schema ***/

const fileServerConfigSchema = schema({
    $id: 'FileServerConfig',
    type: 'object',

    additionalProperties: false,

    required: [...mongoDBApplicationConfigSchema.required],

    properties: {
        ...mongoDBApplicationConfigSchema.properties,
        authentication: {
            type: 'object'
        },
        renderer: {
            type: 'object',
            properties: {
                maxConcurrent: { type: 'number', minimum: 0 }
            },
            additionalProperties: {
                type: 'object',
            }
        }
    }

} as const)

type FileServerConfig = Infer<typeof fileServerConfigSchema>

/*** Exports ***/

export default fileServerConfigSchema

export {
    fileServerConfigSchema,
    FileServerConfig
}