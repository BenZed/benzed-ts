import { ensureMongoDbInstance } from '../../feathers/src/scripts/util'

/*** Config ***/

/**
 * Ensure a mongo db instance is running in the test cluster
 */
export default (): Promise<void> => ensureMongoDbInstance({
    isRunning: false
})