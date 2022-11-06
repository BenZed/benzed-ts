import { ensureMongoDbInstance } from './scripts/util'

import configuration from '@feathersjs/configuration'

import {
    MongoDBApplicationConfig,
    MongoDBConfig
} from './mongo-db-app'

//// Config ////

const config = (configuration()() as unknown as MongoDBApplicationConfig).db as MongoDBConfig

/**
 * Ensure a mongo db instance is running in the test cluster
 */
export default (): Promise<void> => ensureMongoDbInstance({
    isRunning: true,

    clean: true,
    log: false,
    port: config.port,
    cluster: `test`
})