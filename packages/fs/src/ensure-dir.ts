import path from 'path'

import { PathLike } from './types'
import { makeDir, stat } from './export'

/*** Main ***/

/**
 * Creates a directory if it does not exist. 
 * 
 * Returns true if folders needed to be created, false otherwise.
 */
async function ensureDir(pathLike: PathLike): Promise<boolean> {

    const dir = pathLike.toString()
    const dirStat = await stat(dir).catch(() => null)
    if (!dirStat) {
        const parentDir = path.dirname(dir)

        await ensureDir(parentDir)
        await makeDir(dir)
        
        return true 
    }

    if (!dirStat.isDirectory())
        throw new Error(`Cannot ensure directory: ${dir} is a file.`)

    return false
}

/*** Exports ***/

export default ensureDir

export {
    ensureDir
}