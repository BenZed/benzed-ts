
import { Infer } from '@feathersjs/schema'
import { useSchemaDefinition, schema } from './schema'

import { mongoDBConfigSchema } from './mongo-db-config-schema'

/*** Exports ***/

export const mongoDBApplicationConfigSchema = schema({
    $id: 'MongoDbAppConfig',
    type: 'object',
    additionalProperties: false,
    required: ['name', 'port', 'db'],

    properties: {
        name: { type: 'string' },
        port: { type: 'number' },
        db: useSchemaDefinition(mongoDBConfigSchema),
        authentication: { type: 'object' }
    }
} as const)

export type MongoDBApplicationConfig = Infer<typeof mongoDBApplicationConfigSchema>