import { watch } from 'chokidar'

import path from 'path'
import fs from 'fs/promises'

import { 

    PACKAGES_DIR, 

    command,

    readJson,
    writeJson,
    createDependencyWeb, 

    PackageJson,
    PackageSpawnProcess,
    PackageProcess,
    readDirRecursive,

} from './util'

import ensureMongoDb from './util/ensure-mongo-db'

//// Helper ////

const isTypeScriptFile = (file: string): boolean => 
    file.endsWith('.ts')

const isNotInNodeModules = (file: string): boolean => 
    !file.includes('node_modules')

//// State ////

const tsFileContents: Record<string,string> = {}

const dependencyWeb = createDependencyWeb()

//// Processes ////

const testProcess = new PackageSpawnProcess('test:dev', 'npm', 'run', 'test:dev')

const updateDependencyProcess = new PackageProcess('update-deps', async pkgDir => {

    // split this into functions
    const typeScriptFiles = await readDirRecursive(pkgDir, isTypeScriptFile, isNotInNodeModules)

    const depWeb = await dependencyWeb
    const thisPkgName = '@benzed/' + (pkgDir.split(path.sep).at(-1) as string)
    const thisDepWeb = depWeb[thisPkgName]

    // Split local/external deps
    const internalDeps = thisDepWeb.dependencies
    const newInternalDeps: Record<string,string> = {}
    for (const ts of typeScriptFiles) {
        const contents = tsFileContents[ts] ??= await fs.readFile(ts, 'utf-8')
        for (const pkgName in depWeb) {

            const hasPkg = contents.includes(`'${pkgName}'`)
            // Validate dep self-link
            if (hasPkg && pkgName === thisPkgName)
                console.warn(thisPkgName, 'links to itself')
            // validate dep circular link
            else if (hasPkg && thisPkgName in depWeb[pkgName].dependencies)
                throw new Error(`${thisPkgName} and ${pkgName} link to each other`)
            else if (hasPkg)
                newInternalDeps[pkgName] = depWeb[pkgName].currVersion
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

    // Remove existing packagejson internal dependencies
    for (const key in packageJson.dependencies) {
        if (key.startsWith('@benzed'))
            delete packageJson.dependencies[key]
    }

    // Add new dependencies to package.json
    console.log(thisPkgName, 'internal dependencies updated:')
    for (const key in { ...internalDeps, ...newInternalDeps }) {
        console.log(key, internalDeps[key] ?? '(added)', newInternalDeps[key] ?? '(removed)', )
        if (newInternalDeps[key])
            packageJson.dependencies[key] = '^' + newInternalDeps[key]
    }
    thisDepWeb.dependencies = newInternalDeps

    // write
    await writeJson(packageJson, packageJsonFile)

    // Bootstrap
    await command(
        'npm', 
        ['run', 'packages:bootstrap'], 
        { cwd: process.cwd(), stdio: 'inherit' }
    )
})

//// Execute ////

console.clear()

// Start Dev MongoDB
ensureMongoDb({
    isRunning: true,
    log: true,
    cluster: 'test',
    clean: true
})

// Watch for ts changes
watch(PACKAGES_DIR, {
    ignored: 'node_modules',
    followSymlinks: false,
    atomic: 250
}).on('change', async file => {

    if (!isTypeScriptFile(file))
        return 

    const contents = await fs.readFile(file, 'utf-8')
    if (tsFileContents[file] === contents) 
        return 

    console.log(
        file.replace(PACKAGES_DIR, ''), 
        'updated', tsFileContents[file]?.length ?? '(uncached)', '>>', contents.length
    )
    tsFileContents[file] = contents

    if (!updateDependencyProcess.isRunning) 
        await updateDependencyProcess.run(file)
    
    if (!testProcess.isRunning) {
        const onlyThisFile = file.endsWith('.test.ts')

        await testProcess.run(
            file, 
            onlyThisFile 
                ? path.basename(file) 
                : ''
        )
    }

})
