import { watch } from 'chokidar'

import path from 'path'
import fs from 'fs/promises'

import { 

    PACKAGES_DIR, 

    command,

    writeJson,

    PackageSpawnProcess,
    PackageProcess,
    readDirRecursive,
    ROOT_DIR,
    eachPackage,
    FileProcess,

} from './util'

import ensureMongoDb from './util/ensure-mongo-db'

//// Helper ////

const isTypeScriptFile = (file: string): boolean => 
    path.extname(file).endsWith('.ts')

const isNotInNodeModules = (file: string): boolean => 
    !file.includes('node_modules')

//// State ////

const tsFileContentCache: Record<string,string> = {}

//// Processes ////

const testProcess = new PackageSpawnProcess('test:dev', 'npm', 'run', 'test:dev')

const stripSrcSuffixProcess = new FileProcess('strip-src-suffix', async (file) => {

    const contents = await fs.readFile(file, 'utf-8')
    const lines = contents.split('\n')

    const SRC = '/src'

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i]

        const bzImportIndex = line.indexOf('\'@benzed/')
        if (bzImportIndex < 0)
            continue
        
        const srcIndex = line.indexOf(SRC, bzImportIndex)
        if (srcIndex < 0)
            continue 

        lines[i] = line.slice(0, srcIndex) + line.slice(srcIndex + SRC.length)
    }
    
    const newContents = lines.join('\n')
    if (newContents !== contents)
        await fs.writeFile(file, newContents, 'utf-8')

})

const updateDependencyProcess = new PackageProcess('update-deps', async pkgDir => {

    // split this into functions
    const tsFileUrls = await readDirRecursive(
        pkgDir, 
        isTypeScriptFile, 
        isNotInNodeModules
    )

    const pkgs = await eachPackage(json => json)
    const thisPkg = pkgs[pkgDir.split(path.sep).at(-1) as string]
    if (!thisPkg.dependencies)  
        thisPkg.dependencies = {}

    // Build iternal dependencies
    const newInternalDeps: Record<string,string> = {}
    for (const tsFileUrl of tsFileUrls) {
        const tsFileContent = tsFileContentCache[tsFileUrl] ??= await fs.readFile(tsFileUrl, 'utf-8')
        for (const key in pkgs) {
            const pkg = pkgs[key]

            const usesPkg = tsFileContent.includes(`'${pkg.name}'`)
            // Validate dep self-link
            if (usesPkg && pkg.name === thisPkg.name)
                console.warn(thisPkg.name, 'links to itself:', tsFileUrl)

            // validate dep circular link
            else if (usesPkg && pkg.dependencies && thisPkg.name in pkg.dependencies)
                console.error(thisPkg.name, 'and', pkg.name, 'link to each other:', tsFileUrl)

            else if (usesPkg)
                newInternalDeps[pkg.name] = '^' + pkg.version
        }
    }

    // Determine Changes
    const changes: string[] = []
    for (const key in pkgs) {
        const pkg = pkgs[key]

        if (thisPkg.dependencies[pkg.name] !== newInternalDeps[pkg.name]) {
            changes.push(
                `\n${pkg.name}\t${thisPkg.dependencies[pkg.name] ?? '(added)'} ${newInternalDeps[pkg.name] ?? '(removed)'}`
            )
        }
        if (newInternalDeps[pkg.name]) 
            thisPkg.dependencies[pkg.name] = newInternalDeps[pkg.name]
        else 
            delete thisPkg.dependencies[pkg.name]
    }
    if (changes.length > 0) {
        console.log(
            '\n' + thisPkg.name, 
            'internal dependencies updated:',
            ...changes
        )
    } else 
        return 

    // Write Changes
    await writeJson(thisPkg, path.join(pkgDir, 'package.json'))

    // Bootstrap
    await command(
        'npm', 
        ['run', 'packages:bootstrap'], 
        { cwd: ROOT_DIR, stdio: 'inherit', shell: true }
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
    ignored: ['/node_modules/', '/lib/'],
    followSymlinks: false,
    atomic: 250
}).on('change', async file => {

    if (!isTypeScriptFile(file))
        return 

    if (!stripSrcSuffixProcess.isRunning)
        await stripSrcSuffixProcess.run(file, file) // <- Fix this signature, this is stupid.

    const contents = await fs.readFile(file, 'utf-8')
    if (tsFileContentCache[file] === contents) 
        return 
    
    if (testProcess.isRunning) 
        return 

    tsFileContentCache[file] = contents

    const onlyTestThisFile = file.endsWith('.test.ts')
    await testProcess.run(
        file, 
        onlyTestThisFile 
            ? path.basename(file) 
            : ''
    )

    if (!updateDependencyProcess.isRunning)
        await updateDependencyProcess.run(file)

    // rel/path/to/file updated oldsize >> newsize
    console.log(
        '\n' + file.replace(PACKAGES_DIR, ''), 
        'updated', 
        tsFileContentCache[file]?.length ?? '(uncached)', 
        '>>', 
        contents.length
    )

})
