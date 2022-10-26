import { ensureMongoDbInstance } from './scripts/util'

import { MongoDbAppConfig} from './ecs'

import { getDefaultConfiguration } from './util'

/*** Config ***/

const config = getDefaultConfiguration<MongoDbAppConfig>().db

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