import fs from 'fs'
import path from 'path'
import semver from 'semver'

import {
    PackageJson,
    exec,
    writeJson,
    forEachPackage,
    assertBranch,
} from './util'

//// Publish Packages ////

// For each package, check that the version in the json is up-to-date with what is
// on npm. 
//
// If the package is not up to date, run it's tests, build it and publish it to npm
// relative to the lib folder (rather than the root folder) for cleaner imports.
//
// Because I want packages hoisted up from their /lib subfolder, I'm not using 
// lerna publish.

async function getNpmVersionData(
    name: string,
    currentVersion: string
): Promise<{ upToDate: boolean, version: string }> {

    try {
        const upstreamVersion = (await exec(`npm info ${name} version`)).trim()
        return {
            upToDate: semver.lte(currentVersion, upstreamVersion),
            version: upstreamVersion
        }
    } catch (e) {

        const { message } = e as Error

        if (
            message.includes('is not in the npm registry') ||
            message.includes('is not in this registry')
        ) {
            return {
                upToDate: false,
                version: '(unpublished)'
            }
        } else
            throw e
    }
}

/**
 * I'd prefer if benzed packages didn't have a 'lib' subfolder in them.
 */
async function createTarBallPackageJson(json: PackageJson, url: string): Promise<string> {

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    await exec('npm publish --access=public', { cwd: path.join(url, 'lib') })
    process.stdout.write('\bed √\n')

    await fs.promises.unlink(tarBallPackageJsonUrl).catch(e => void e)
}

//// Execute ////

void async function publishPackages() {

    try {

        await assertBranch('master')

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
                process.stdout.write('x\n')
                failCount++
            }
        })

        process.stdout.write(`${publishCount} packages published\n`)
        if (failCount > 0)
            process.stdout.write(`${failCount} packages failed\n`)

    } catch (e) {
        console.error('publish failed: ', (e as Error).message)
    }

}()
