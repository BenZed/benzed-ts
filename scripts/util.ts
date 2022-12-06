import fs from 'fs/promises'
import path from 'path'
import { spawn, SpawnOptions } from 'child_process'

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

export function command(cmd: string, args: readonly string[], options: SpawnOptions = {}): Promise<string> {
    return new Promise<string>((resolve, reject) => {

        const data: string[] = []

        const spawned = spawn(cmd, args, options)
            .once('exit', () => resolve(data.join('').trim()))
            .once('error', reject)
            
        spawned.stdout?.on('data', d => data.push(`${d}`))
    })
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

export async function assertBranch(target: string): Promise<void> {
    const branch = (await command('git', ['rev-parse', '--abbrev-ref', 'HEAD'])).trim()
    if (branch !== target)
        throw new Error(`current branch "${branch}" is not "${target}"`)
}

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

//// Process Classes ////

export class FileProcess {

    get name(): string {
        return this._name
    }
    constructor(
        protected readonly _name: string,
        protected _onRun: (file: string) => Promise<void>
    ) {}

    private _running: Promise<void> | null = null
    get isRunning(): boolean {
        return !!this._running
    }
    
    run(file: string): Promise<void> {
        if (this.isRunning)
            throw new Error(`${this.name} is already running`)

        this._running = this
            ._onRun(file)
            .then(this._onComplete)
            .catch(this._onComplete)

        return this._running
    }

    //// Processes ////

    protected readonly _onComplete = (error: Error | void): void => {
        if (!this.isRunning)
            throw new Error(`${this.name} is is not running`)

        if (error instanceof Error)
            console.error('\n' + this.name,'error', error)

        this._running = null
    }
}

export class PackageProcess extends FileProcess {

    protected _pkgDir = ''
    get dir(): string {
        return this._pkgDir
    }

    override get name(): string {
        return this.pkg + ' ' + this._name
    }

    get pkg(): string {
        return '@benzed/' + path.basename(this._pkgDir)
    }

    constructor(
        name: string,
        onRun: (pkgDir: string) => Promise<void>
    ) {
        super(name, onRun)
    }

    override run(file: string): Promise<void> {

        const filePkgDirIndex = file.indexOf(PACKAGES_DIR)
        if (filePkgDirIndex < 0)
            throw new Error(this.constructor.name + ' must be called in package files')

        const pkgDir = file.slice(
            filePkgDirIndex,
            file.indexOf(path.sep, filePkgDirIndex + PACKAGES_DIR.length + 1)
            //                                                   ^ ignore first slash
        )
        
        return super.run(this._pkgDir = pkgDir)
    }
}

export class PackageSpawnProcess extends PackageProcess {

    constructor(
        name: string,
        cmd: string,
        ...args: readonly string []
    ) {
        super(
            name,
            async (pkgDir: string) => {
                console.clear()
                await command(cmd, args, { cwd: pkgDir, stdio: 'inherit' })
            }
        )
    }
}
