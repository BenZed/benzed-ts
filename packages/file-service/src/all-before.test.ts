import { ensureMongoDbInstance } from '../../feathers/src/scripts/util'

import { Uploader, TEST_FILE_SERVER_CONFIG } from './util.test'

/*** Main ***/

/**
 * Ensure a mongo db instance is running in the test cluster
 */
export default async (): Promise<void> => {
    
    await ensureMongoDbInstance({
        isRunning: true,

        clean: true,
        log: false,
        port: TEST_FILE_SERVER_CONFIG.port,
        cluster: 'test'
    })

    await Uploader.createLargeBinaryListFile()

}