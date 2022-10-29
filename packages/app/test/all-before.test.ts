import { ensureMongoDbInstance } from '../../feathers/src/scripts/util'

import { DEFAULT_PORT } from '../src/modules/connection'

/*** Config ***/

/**
 * Ensure a mongo db instance is running in the test cluster
 */
export default (): Promise<void> => ensureMongoDbInstance({
    isRunning: true,

    clean: true,
    log: false,
    port: DEFAULT_PORT + 500,
    cluster: `test`
})