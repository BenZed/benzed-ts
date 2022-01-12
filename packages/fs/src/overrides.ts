import {
    createReadStream,
    createWriteStream,

    promises,

    PathLike,
    Stats,

    ReadStream,
    WriteStream,

    WriteFileOptions,
    ObjectEncodingOptions,
    BufferEncodingOption,

    WatchOptions,
    WatchEventType,
    WatchListener,

    StatOptions

} from 'fs'

/**
 * So, I was about to write a bunch of promisifications 
 * of the fs module when I remembered that they were added
 * to node like, a couple of years ago.
 * 
 * Oh well, I'll re-export them and call it my own module.
 * I don't care. Fuck you. 
 * 
 * At least this way I don't have to write tests.
 */

/*** Shortcuts ***/

const {
    readdir,
    readFile,
    writeFile,

    watch,

    unlink,

    stat
} = promises

export {
    createReadStream,
    createWriteStream,

    readFile,
    readdir,
    readdir as readDir,

    writeFile,

    unlink,

    watch,

    stat
}

export type {

    PathLike,

    Stats,

    ReadStream,
    WriteStream,

    WriteFileOptions,
    ObjectEncodingOptions,
    BufferEncodingOption,

    WatchOptions,
    WatchEventType,
    WatchListener,

    StatOptions
}