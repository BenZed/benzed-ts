
export {
    readdirSync as readDir,
    mkdirSync as makeDir,
    rmdirSync as removeDir, 

    readFileSync as readFile,
    writeFileSync as writeFile,
    appendFileSync as appendFile,
    copyFileSync as copyFile,

    unlinkSync as removeFile,

    unlinkSync as unlink,
    accessSync as access,
    existsSync as exists,
    statSync as stat

} from 'fs'

export * from './types'