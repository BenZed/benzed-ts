
import {
    createMongoDBApplication,
    MongoDBApplication
} from '@benzed/feathers'

import services, { FileServices } from './services'
import middleware from './middleware'

import {
    $fileServerConfig,
    FileServerConfig
} from './schemas/file-server-config-schema'

import { HookContext, Service } from '@feathersjs/feathers'

/*** Types ***/

type FileServerApp = MongoDBApplication<FileServices, FileServerConfig>

type FileServerHookContext = HookContext<FileServerApp, Service>

/*** Main ***/

function createFileServerApp(): FileServerApp {

    const fileServerApp = createMongoDBApplication<FileServices, FileServerConfig>(
        $fileServerConfig
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
    FileServerHookContext
}
