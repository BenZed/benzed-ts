import fs, { Stats } from 'fs'
import path from 'path'
import cp, { ExecOptions } from 'child_process'
import semver from 'semver'

/*** Publish Packages ***/

// For each package, check that the version in the json is up-to-date with what is
// on npm. 
// If the package is not up to date, run it's tests, build it and publish it to npm
// relative to the lib folder (rather than the root folder) for cleaner imports.

/*** Types ***/

type PackageJson = {
    name: string
    private: boolean
    main: string
    version: string
}

/*** Setup ***/

const PACKAGES_DIR = path.join(process.cwd(), 'packages')

/*** Helper ***/

function readdir(url: string): Promise<string[]> {
    return new Promise<string[]>((resolve, reject) =>
        fs.readdir(url, (err, dirs) => {
            if (err)
                reject(err)
            else
                resolve(dirs)
        }))
}

function stat(url: string): Promise<Stats> {
    return new Promise<Stats>((resolve, reject) =>
        fs.stat(url, (err, stat) => {
            if (err)
                reject(err)
            else
                resolve(stat)
        }))
}

function unlink(url: string): Promise<void> {
    return new Promise<void>((resolve, reject) =>
        fs.unlink(url, (err) => {
            if (err)
                reject(err)
            else
                resolve()
        }))
}

function readJson(url: string): Promise<unknown> {
    return new Promise<unknown>((resolve, reject) =>
        fs.readFile(url, 'utf-8', (err, txt) => {
            if (err)
                reject(err)
            else
                resolve(JSON.parse(txt))
        }))
}

function writeJson(json: unknown, url: string): Promise<void> {
    return new Promise<void>((resolve, reject) =>
        fs.writeFile(url, JSON.stringify(json, null, 4), 'utf-8', (err) => {
            if (err)
                reject(err)
            else
                resolve()
        }))
}

function exec(cmd: string, options?: ExecOptions): Promise<string> {
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

async function forEachPackage(
    func: (json: PackageJson, url: string) => Promise<void>
): Promise<void> {

    const packageNames = await readdir(PACKAGES_DIR)

    for (const packageName of packageNames) {

        const packageUrl = path.join(PACKAGES_DIR, packageName)

        const packageStat = await stat(packageUrl)
        if (!packageStat.isDirectory())
            continue

        const packageJsonUrl = path.join(packageUrl, 'package.json')
        const packageJson = await readJson(packageJsonUrl) as PackageJson

        await func(packageJson, packageUrl)
    }

}

async function getNpmVersionData(
    name: string,
    currentVersion: string
): Promise<{ upToDate: boolean, version: string }> {

    const upstreamVersion = (await exec(`npm info ${name} version`)).trim()
    return {
        upToDate: semver.lte(currentVersion, upstreamVersion),
        version: upstreamVersion
    }
}

/**
 * I'd prefer if benzed packages didn't have a 'lib' subfolder in them.
 */
async function createTarBallPackageJson(json: PackageJson, url: string): Promise<string> {
    const tarBallRootJson = { ...json } as any
    delete tarBallRootJson.main
    const tarBallRootJsonUrl = path.join(url, 'lib', 'package.json')
    await writeJson(tarBallRootJson, tarBallRootJsonUrl)

    // TODO npm pack, check for irregularities or unintentionally included files
    // process.stdout.write('check ')
    // await exec('npm pack', { cwd: path.join(url, 'lib') })
    // process.stdout.write('\b\b\b\b\b\b')

    return tarBallRootJsonUrl
}

async function publishPackage(json: PackageJson, url: string): Promise<void> {

    process.stdout.write('test ')
    await exec('npm run test', { cwd: url })
    process.stdout.write('\b\b\b\b\b')

    process.stdout.write('build ')
    await exec('npm run build', { cwd: url })
    process.stdout.write('\b\b\b\b\b\b')

    const tarBallPackageJsonUrl = await createTarBallPackageJson(json, url)

    process.stdout.write('publish ')
    await exec('npm publish', { cwd: path.join(url, 'lib') })
    process.stdout.write('\bed √\n')

    await unlink(tarBallPackageJsonUrl).catch(e => void e)
}

/*** Execute ***/

void async function publishPackages() {

    let publishCount = 0
    let failCount = 0

    await forEachPackage(async (packageJson, packageUrl) => {

        const { main, version, name, private: _private } = packageJson

        if (_private || !version || !main || !name)
            return

        const npmData = await getNpmVersionData(name, version)
        if (npmData.upToDate)
            return

        process.stdout.write(
            `${name} ${npmData.version} -> ${version} `
        )

        try {
            await publishPackage(packageJson, packageUrl)
            publishCount++
        } catch (e) {
            process.stdout.write(
                'x\n'
            )
            failCount++
        }
    })

    process.stdout.write(`${publishCount} packages published\n`)
    if (failCount > 0)
        process.stdout.write(`${failCount} packages failed\n`)
}()
