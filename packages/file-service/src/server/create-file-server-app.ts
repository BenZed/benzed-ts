
import {
    createMongoDBApplication,
    MongoDBApplication,
    MongoDBApplicationConfig
} from '@benzed/feathers'

import services from './services'
import middleware from './middleware'

/* eslint-disable @typescript-eslint/no-empty-interface */

/*** Types ***/

interface FileServerConfig extends MongoDBApplicationConfig {
    //
}

interface FileServices {
    //
}

type FileServerApp = MongoDBApplication<FileServices, FileServerConfig>

/*** Main ***/

function createFileServerApp(): FileServerApp {
    const fileServerApp = createMongoDBApplication<FileServices, FileServerConfig>()

    fileServerApp.configure(services)
    fileServerApp.configure(middleware)

    return fileServerApp
}

/*** Exports ***/

export default createFileServerApp

export {

    createFileServerApp,

    FileServerApp,
    FileServerConfig,
    FileServices
}
