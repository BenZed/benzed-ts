import { ensureMongoDbInstance } from '../../feathers/src/scripts/util'

/**
 * Ensure a mongo db instance is halted in the test cluster
 */
export default (): Promise<void> => ensureMongoDbInstance({
    isRunning: false
})