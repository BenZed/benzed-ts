import {
    mongoDBApplicationConfigSchema,
    schema
} from '@benzed/feathers'

import { Infer } from '@feathersjs/schema'

/*** Schema ***/

const fileServerConfigSchema = schema({
    $id: 'FileServerConfig',
    type: 'object',

    additionalProperties: false,

    required: [...mongoDBApplicationConfigSchema.required],

    properties: {
        ...mongoDBApplicationConfigSchema.properties,

        renderer: {

            type: ['null', 'object'],

            required: ['settings'],

            additionalProperties: false,

            properties: {
                maxConcurrent: { type: 'number', minimum: 0 },
                settings: {
                    type: 'object',
                    additionalProperties: {
                        type: 'object',
                    }
                }
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