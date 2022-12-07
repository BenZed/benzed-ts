import { watch } from 'chokidar'

import path from 'path'
import fs from 'fs/promises'

import { 

    PACKAGES_DIR, 

    createDependencyWeb, 
    PackageProcess, 
    PackageSpawnProcess, 
    readDirRecursive, 
    readJson,
    PackageJson,
    writeJson,
    command

} from './util'

//// Helper ////

const isTypeScriptFile = (file: string): boolean => 
    file.endsWith('.ts')

//// State ////

const tsFileContents: Record<string,string> = {}

const testProcess = new PackageSpawnProcess('test:dev', 'npm', 'run', 'test:dev')

const dependencyWeb = createDependencyWeb()

//// Processes ////

const updateDependencyProcess = new PackageProcess('update-deps', async pkgDir => {

    const typeScriptFiles = await readDirRecursive(pkgDir, isTypeScriptFile)

    const depWeb = await dependencyWeb
    const thisPkgName = '@benzed' + pkgDir.slice(pkgDir.lastIndexOf(path.sep))
    const thisDepWeb = depWeb[thisPkgName]

    // Split local/external deps
    const externalDeps = { ...thisDepWeb.dependencies }
    const internalDeps = { ...externalDeps }
    for (const depName in thisDepWeb.dependencies) {
        if (depName.startsWith('@benzed'))
            delete externalDeps[depName]
        else 
            delete internalDeps[depName]
    }

    // Find Internal deps
    const newInternalDeps: Record<string,string> = {}
    for (const ts of typeScriptFiles) {
        const contents = tsFileContents[ts] ??= await fs.readFile(ts, 'utf-8')
        for (const pkgName in depWeb) {

            const hasPkg = contents.includes(`'${pkgName}'`)
            if (hasPkg && pkgName === thisPkgName)
                console.warn(thisPkgName, 'links to itself')
            else if (hasPkg && thisPkgName in depWeb[pkgName].dependencies)
                throw new Error(`${thisPkgName} and ${pkgName} link to each other`)
            else if (hasPkg)
                newInternalDeps[pkgName] = '^' + depWeb[pkgName].currVersion
        }
    }

    // Check if deps changed
    let changed = false
    for (const key in { ...internalDeps, ...newInternalDeps }) {
        if (newInternalDeps[key] !== internalDeps[key]) {
            changed = true 
            break
        }
    }

    if (!changed)
        return 

    // Re-Write package.json
    const packageJsonFile = path.join(pkgDir, 'package.json')
    const packageJson = await readJson(packageJsonFile) as PackageJson

    thisDepWeb.dependencies = {
        ...externalDeps,
        ...newInternalDeps
    }
    await writeJson({
        ...packageJson,
        dependencies: thisDepWeb.dependencies
    }, packageJsonFile)

    console.log(thisPkgName, 'internal dependencies updated:')
    for (const key in newInternalDeps)
        console.log(key, newInternalDeps[key])

    // Bootstrap
    await command('npm', ['run', 'packages:bootstrap'], { cwd: process.cwd(), stdio: 'inherit' })
})

//// Execute ////

watch(PACKAGES_DIR).on('change', async file => {

    if (!isTypeScriptFile(file))
        return 

    if (file.includes('node_modules'))
        return

    const contents = await fs.readFile(file, 'utf-8')
    if (tsFileContents[file] === contents) 
        return 
    tsFileContents[file] = contents

    if (!testProcess.isRunning) 
        await testProcess.run(file)

    if (!updateDependencyProcess.isRunning) 
        await updateDependencyProcess.run(file)
})
