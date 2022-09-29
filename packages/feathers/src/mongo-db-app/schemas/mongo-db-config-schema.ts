
import { Infer, schema } from '../../schemas'

/*** Exports ***/

export const mongoDBConfigSchema = schema({
    $id: 'MongoDbConfig',
    type: 'object',
    additionalProperties: false,
    required: ['uri', 'database'],

    properties: {

        port: { type: 'number' },
        user: { type: 'string' },
        password: { type: 'string' },

        uri: { type: 'string' },
        database: { type: 'string' },

    }
} as const)

export type MongoDBConfig = Infer<typeof mongoDBConfigSchema>