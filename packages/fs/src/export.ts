export {

    mkdir as makeDir,
    rmdir as removeDir,
    rm as removeFile,

    readFile,
    writeFile,
    appendFile,
    copyFile,

    unlink,
    rm as remove,

    watch,

    access,
    stat,

} from 'fs/promises'

export {

    createReadStream,
    createWriteStream,

} from 'fs'

export * from './exists'
export * from './ensure-dir'
export * from './read-dir'
export * from './read-json'
export * from './write-json'
export * from './types'
export * as sync from './sync'