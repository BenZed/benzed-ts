import { ensureMongoDbInstance } from '../../feathers/src/scripts/util'

import { DEFAULT_MONGODB_PORT } from '../src/modules/mongodb'

/*** Config ***/

/**
 * Ensure a mongo db instance is running in the test cluster
 */
export default (): Promise<void> => ensureMongoDbInstance({

    isRunning: true,

    clean: true,
    log: `process`,

    port: DEFAULT_MONGODB_PORT,
    cluster: `test`

})