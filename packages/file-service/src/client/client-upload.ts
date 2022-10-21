import { Writable } from 'stream'

import fs from '@benzed/fs'

import { File } from '../files-service'
import { RENDER_DIR_NAME } from '../files-service/constants'

/*** Main ***/

function clientUpload(
    _host: string,
    file: File,
    preview: { setting: string, ext: string }
): Writable {

    // TEMP 
    const filePath = 
        `./storage/test/files/${file._id}` + 
        `/${RENDER_DIR_NAME}/${preview.setting}${preview.ext}`

    return fs.createWriteStream(filePath)
}

/*** Exports ***/

export default clientUpload

export {
    clientUpload
}