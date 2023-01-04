
import { Uploader } from './util.test'

//// Main ////

/**
 * Ensure a mongo db instance is running in the test cluster
 */
export default async (): Promise<void> => {
    await Uploader.createLargeBinaryListFile()
}