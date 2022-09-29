
import { useSchemaDefinition, Infer, schema } from '../../schemas'
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
        db: useSchemaDefinition(mongoDBConfigSchema)
    }
} as const)

export type MongoDBApplicationConfig = Infer<typeof mongoDBApplicationConfigSchema>