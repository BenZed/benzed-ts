import fs from 'fs/promises'
import path from 'path'

export async function readDirRecursive(
    dir: string, 
    filter: (file: string) => boolean = () => true,
): Promise<readonly string[]> {

    const names = await fs.readdir(dir)

    const urls: string[] = []

    for (const name of names) {
        if (name === 'node_modules')
            continue

        const url = path.join(dir, name)

        const stat = await fs.stat(url)
        if (stat.isDirectory()) {
            urls.push(
                ...await readDirRecursive(url, filter)
            )
        } else if (filter(url))
            urls.push(url)
    }

    return urls
}
