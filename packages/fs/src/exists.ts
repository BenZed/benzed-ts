
import { stat } from './export'
import { StatOptions, PathLike } from './types'

//// Main ////

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

//// Exports ////

export default exists

export {
    exists
}