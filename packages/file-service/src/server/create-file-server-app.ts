
import {
    createMongoDBApplication,
    MongoDBApplication,
    MongoDBApplicationConfig
} from '@benzed/feathers'

import services from './services'
import middleware from './middleware'

/*** Types ***/

type FileServerConfig = MongoDBApplicationConfig

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface FileServices { }

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
