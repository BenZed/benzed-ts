import { Readable } from 'stream'

import fs from '@benzed/fs'

import { File } from '../files-service'

/*** Main ***/

function clientDownload(
    _host: string,
    file: File
): Readable {

    // TEMP 
    const filePath = `./storage/test/files/${file._id}/${file.name}${file.ext}`
    return fs.createReadStream(filePath)

}
/*** Exports ***/

export default clientDownload

export {
    clientDownload
}