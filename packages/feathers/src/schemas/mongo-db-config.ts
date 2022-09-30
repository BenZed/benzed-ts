
import { $, Infer } from '@benzed/schema'
import { $port } from './util'

/*** Exports ***/

export const $mongoDBConfig = $.shape({
    uri: $.string(),
    port: $port.optional(),
    database: $.string().optional(),
    user: $.string().optional(),
    password: $.string().optional(),
})

/**
 * Items required for mongodb
 */
export type MongoDBConfig = Infer<typeof $mongoDBConfig>