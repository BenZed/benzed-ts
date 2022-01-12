
import { stat, StatOptions, PathLike } from './overrides'

/*** Main ***/

/**
 * Returns true if the file exists, false otherwise.
 */
async function exists(url: PathLike, statOpts?: StatOptions): Promise<boolean> {
    try {
        await stat(url, statOpts)

        return true
    } catch {
        return false
    }
}

/*** Exports ***/

export default exists

export {
    exists
}