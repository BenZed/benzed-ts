import fs from 'fs'
import path from 'path'
import cp, { ExecOptions } from 'child_process'

/*** Types ***/

export type PackageJson = {
    name: string
    private: boolean
    main: string
    version: string
    dependencies: {
        [key: string]: string
    }
}

/*** Constants ***/

export const PACKAGES_DIR = path.join(process.cwd(), 'packages')

/*** Helper ***/

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

export function exec(cmd: string, options?: ExecOptions): Promise<string> {
    return new Promise<string>((resolve, reject) =>
        cp.exec(cmd, options ?? {}, (err, output) => {
            if (err) {
                reject(
                    new Error(`exec ${cmd} failed: ${(err as Error).message}`)
                )
            } else
                resolve(output)
        }))
}

export async function forEachPackage(
    func: (json: PackageJson, url: string) => void | Promise<void>
): Promise<void> {

    const packageNames = await fs.promises.readdir(PACKAGES_DIR)

    for (const packageName of packageNames) {

        const packageUrl = path.join(PACKAGES_DIR, packageName)

        try {
            const packageStat = await fs.promises.stat(packageUrl)
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

export async function assertBranch(target: string): Promise<void> {
    const branch = (await exec('git rev-parse --abbrev-ref HEAD')).trim()
    if (branch !== target)
        throw new Error(`current branch "${branch}" is not "${target}"`)
}
