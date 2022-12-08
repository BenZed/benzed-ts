import fs from 'fs'
import path from 'path'

//// Types ////

export type PackageJson = {
    name: string
    private: boolean
    main: string
    version: string
    dependencies: {
        [key: string]: string
    }
}

//// Constants ////

const ROOT_DIR_NAME = 'benzed-ts'

export const ROOT_DIR = __dirname.substring(0, __dirname.lastIndexOf(ROOT_DIR_NAME) + ROOT_DIR_NAME.length)
if (!ROOT_DIR.includes(ROOT_DIR_NAME) || !fs.existsSync(ROOT_DIR))
    throw new Error(`Could not find ${ROOT_DIR_NAME} directory.`)

export const PACKAGES_DIR = path.join(ROOT_DIR, 'packages')

//// Helper ////

// I'm not using the helpers I created in @benzed/fs because I feel like
// the script helpers should be a decoupled codebase from the packages.
export async function readJson(url: string): Promise<unknown> {
    const str = await fs.promises.readFile(url, 'utf-8')
    return JSON.parse(str)
}

export async function writeJson(json: unknown, url: string): Promise<void> {
    await fs.promises.writeFile(
        url,
        JSON.stringify(json, null, 4)
    )
}

type PackageMethod = (json: PackageJson, url: string) => unknown 

export async function eachPackage<P extends PackageMethod>(
    method: P
): Promise<Record<string, ReturnType<P>>> {

    const results: Record<string, ReturnType<P>> = {}

    const packageNames = await fs.promises.readdir(PACKAGES_DIR)

    for (const packageName of packageNames) {

        const packageUrl = path.join(PACKAGES_DIR, packageName)

        try {
            const packageStat = await fs.promises.stat(packageUrl)
            if (!packageStat.isDirectory())
                continue

            const packageJsonUrl = path.join(packageUrl, 'package.json')
            const packageJson = await readJson(packageJsonUrl) as PackageJson

            results[packageName] = await method(packageJson, packageUrl) as ReturnType<P>
        } catch (e) {
            const message = (e as Error).message
            if (!message.includes('ENOENT'))
                console.error((e as { message: string }).message)
        }
    }

    return results
}

