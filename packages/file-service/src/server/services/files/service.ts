import { RendererConfig } from '@benzed/renderer'

/* eslint-disable @typescript-eslint/indent, require-await */

interface FileServiceOptions {

    /**
     * Options for the preview renderer
     */
    render: RendererConfig

    /**
     * Directory on the local file system to store files.
     */
    fs?: null | string

    /**
     * Configuration for storing files on s3
     */
    s3?: null | {
        bucket: string
        accessKeyId: string
        secretAccessKey: string
    }
}

/*** Main ***/

export {
    FileServiceOptions
}