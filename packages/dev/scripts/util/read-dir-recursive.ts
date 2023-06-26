import fs from 'fs/promises'
import path from 'path'

//// Types ////

type UrlFilter = (path: string) => boolean

//// Main ////

export async function readDirRecursive(
    dir: string, 
    fileFilter: UrlFilter = () => true,
    dirFilter: UrlFilter = () => true
): Promise<readonly string[]> {

    const names = await fs.readdir(dir)

    const urls: string[] = []

    for (const name of names) {
        const url = path.join(dir, name)

        const stat = await fs.stat(url)
        const isDirectory = stat.isDirectory()
        if (isDirectory && !dirFilter(url) || !isDirectory && !fileFilter(url))
            continue

        urls.push(
            ...isDirectory 
                ? await readDirRecursive(url, fileFilter, dirFilter) 
                : [url]
        )
        
    }

    return urls
}
