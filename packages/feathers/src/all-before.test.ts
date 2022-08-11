import { ensureMongoDbInstance } from './scripts/util'

import configuration from '@feathersjs/configuration'

import {
    MongoApplicationConfig,
    MongoDbConfig
} from './mongo-app'

/*** Config ***/

const config = (configuration()() as unknown as MongoApplicationConfig).db as MongoDbConfig

/**
 * Ensure a mongo db instance is running in the test cluster
 */
export default (): Promise<void> => ensureMongoDbInstance({
    isRunning: true,

    clean: true,
    log: false,
    port: config.port,
    cluster: 'test'
})