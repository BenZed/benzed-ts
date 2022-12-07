import fs from 'fs/promises'
import path from 'path'

//// Types ////

type UrlFilter = (path: string) => boolean

//// Main ////

export async function readDirRecursive(
    dir: string, 
    ...filters: UrlFilter[]
): Promise<readonly string[]> {

    const names = await fs.readdir(dir)

    const urls: string[] = []

    for (const name of names) {
        const url = path.join(dir, name)

        if (!filters.some(filter => filter(url)))
            continue

        const stat = await fs.stat(url)
        if (stat.isDirectory()) {
            urls.push(
                ...await readDirRecursive(url, ...filters)
            )
        }
    }

    return urls
}
