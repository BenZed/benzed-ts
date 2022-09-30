
import { $, Infer } from '@benzed/schema'
import { $mongoDBConfig } from './mongo-db-config'
import { $port } from './util'

/*** Exports ***/

export const $mongoDBApplicationConfig = $({
    name: $.string(),
    port: $port,
    db: $mongoDBConfig
})

export type MongoDBApplicationConfig = Infer<typeof $mongoDBApplicationConfig>
