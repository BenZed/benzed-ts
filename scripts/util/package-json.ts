import fs from 'fs/promises'
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

export type DependencyWeb = Record<string, {
    name: string
    currVersion: string
    nextVersion: string
    dependencies: Record<string, string>
}>

//// Constants ////

export const PACKAGES_DIR = path.join(process.cwd(), 'packages')

//// Helper ////

// I'm not using the helpers I created in @benzed/fs because I feel like
// the script helpers should be a decoupled codebase from the packages.
export async function readJson(url: string): Promise<unknown> {
    const str = await fs.readFile(url, 'utf-8')
    return JSON.parse(str)
}

export async function writeJson(json: unknown, url: string): Promise<void> {
    await fs.writeFile(
        url,
        JSON.stringify(json, null, 4)
    )
}

export async function forEachPackage(
    func: (json: PackageJson, url: string) => void | Promise<void>
): Promise<void> {

    const packageNames = await fs.readdir(PACKAGES_DIR)

    for (const packageName of packageNames) {

        const packageUrl = path.join(PACKAGES_DIR, packageName)

        try {
            const packageStat = await fs.stat(packageUrl)
            if (!packageStat.isDirectory())
                continue

            const packageJsonUrl = path.join(packageUrl, 'package.json')
            const packageJson = await readJson(packageJsonUrl) as PackageJson

            await func(packageJson, packageUrl)
        } catch (e) {
            const message = (e as Error).message
            if (!message.includes('ENOENT'))
                console.error((e as { message: string }).message)
        }
    }
}

export async function createDependencyWeb(): Promise<DependencyWeb> {

    const web: DependencyWeb = {}

    await forEachPackage((packageJson) => {

        const { name, version, dependencies } = packageJson

        if (!version)
            return

        web[name] = {
            name,
            currVersion: version,
            nextVersion: version,
            dependencies: {}
        }

        for (const dependency in dependencies) {
            if (!dependency.startsWith('@benzed'))
                continue

            web[name].dependencies[dependency] = dependencies[dependency].replace('^', '')
        }
    })

    return web
}
