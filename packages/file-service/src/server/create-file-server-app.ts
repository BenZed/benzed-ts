
import {
    createMongoDBApplication,
    MongoDBApplication
} from '@benzed/feathers'

import services from './services'
import middleware from './middleware'

import {
    fileServerConfigSchema,
    FileServerConfig
} from './schemas/file-server-config-schema'

/* eslint-disable @typescript-eslint/no-empty-interface */

interface FileServices {
    //
}

type FileServerApp = MongoDBApplication<FileServices, FileServerConfig>

/*** Main ***/

function createFileServerApp(): FileServerApp {

    const fileServerApp = createMongoDBApplication<FileServices, FileServerConfig>(
        fileServerConfigSchema
    )

    fileServerApp.configure(services)
    fileServerApp.configure(middleware)

    return fileServerApp
}

/*** Exports ***/

export default createFileServerApp

export {

    createFileServerApp,

    FileServerApp,
    FileServices
}
