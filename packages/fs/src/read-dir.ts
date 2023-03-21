
import { readdir, stat } from 'fs/promises'
import { join, } from 'path'

import { PathLike, ObjectEncodingOptions, Stats } from './types'

//// Helper ////

interface ReadDirOptions extends ObjectEncodingOptions {

    withFileTypes?: false
    
    /**
     * Get the names of files in nested directories
     */
    recursive?: boolean

    /**
     * Retreive the list of full urls instead of just names
     */
    asUrls?: boolean

    filter?: (url: string, stat: Stats) => boolean
}

//// Main ////

async function readDir(dir: PathLike, options: ReadDirOptions = {}): Promise<string[]> {

    const { recursive, filter, asUrls, ...rest } = options

    const output: string[] = []
    for (const name of await readdir(dir, rest)) {
        const url = join(dir.toString(), name)

        const stats = (recursive || filter) && await stat(url) 

        const pass = filter?.(url, stats as Stats)
        if (pass)
            output.push(asUrls ? url : name)

        if (pass && recursive && (stats as Stats).isDirectory())
            output.push(...await readDir(url, options)) 
    }

    return output
}

//// Exports ////

export default readDir

export {
    readDir
}