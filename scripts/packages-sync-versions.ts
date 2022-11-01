
import { assertBranch, forEachPackage, writeJson } from './util'
import semver from 'semver'

import path from 'path'

//// Sync Package Versions ////

// So, up until mid version 3 of most benzed packages, I've been
// using * as the inter-dependency version specifier, which is a 
// great double donk pylon way to break shit. 
// 
// Lerna is certainly capable of managing this on it's own, but 
// because I have a customized publish script, I might as well use
// a customized version script as well.

//// Helper ////

type DependencyWeb = Record<string, {
    name: string
    currVersion: string
    nextVersion: string
    dependencies: Record<string, string>
}>

const createDependencyWeb = async (): Promise<DependencyWeb> => {

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
            if (!dependency.startsWith(`@benzed`))
                continue

            web[name].dependencies[dependency] = dependencies[dependency].replace(`^`, ``)
        }

    })

    return web
}

function sourceVersionIncrement(
    fromVersion: string,
    toVersion: string
): null | 'major' | 'minor' | 'patch' {

    const fromParsed = semver.parse(fromVersion)
    const toParsed = semver.parse(toVersion)

    // conveting * to an actual version. This should be major, but fuck it. 
    // I'm calling it a bug-fix.
    if (fromVersion === `*`)
        return `patch`

    if (!fromParsed)
        throw new Error(`${fromVersion} could not be parsed!`)

    if (!toParsed)
        throw new Error(`${toVersion} could not be parsed!`)

    if (toParsed.major > fromParsed.major)
        return `major`

    if (toParsed.minor > fromParsed.minor)
        return `minor`

    if (toParsed.patch > fromParsed.patch)
        return `patch`

    return null
}

function syncDependencyWebVersions(web: DependencyWeb): DependencyWeb {

    let versionsAreInSync = false

    do {

        versionsAreInSync = true

        for (const currPkgName in web) {

            const currPkg = web[currPkgName]

            for (const depPkgName in currPkg.dependencies) {

                const depPkg = web[depPkgName]

                const depPkgInstalledVersion = currPkg.dependencies[depPkgName]
                const depPkgActualVersion = depPkg.nextVersion

                const release = sourceVersionIncrement(
                    depPkgInstalledVersion,
                    depPkgActualVersion
                )
                if (!release)
                    continue

                currPkg.dependencies[depPkgName] = depPkgActualVersion

                const nextVersion = semver.inc(
                    currPkg.currVersion,
                    release
                )

                if (nextVersion && semver.gt(nextVersion, currPkg.nextVersion)) {
                    currPkg.nextVersion = nextVersion
                    versionsAreInSync = false
                }

            }
        }

    } while (!versionsAreInSync)

    return web
}

async function updatePackages(web: DependencyWeb): Promise<void> {

    await forEachPackage(async (pkgJson, pkgUrl) => {

        const { name } = pkgJson

        const currPkg = web[name]
        if (!currPkg)
            return

        if (pkgJson.version === currPkg.nextVersion)
            return

        pkgJson.version = currPkg.nextVersion

        console.log(name,
            `update version`,
            currPkg.currVersion,
            `->`,
            currPkg.nextVersion
        )

        for (const depPkgName in currPkg.dependencies)
            pkgJson.dependencies[depPkgName] = `^` + currPkg.dependencies[depPkgName]

        await writeJson(pkgJson, path.join(pkgUrl, `package.json`))
    })

}

//// Execute ////

void async function setPackageVersions() {

    try {

        await assertBranch(`master`)

        const web = await createDependencyWeb()

        syncDependencyWebVersions(web)

        await updatePackages(web)

        console.log(`version sync complete`)

    } catch (e) {
        console.error(`version sync failed: `, (e as Error).message)
    }

}()
