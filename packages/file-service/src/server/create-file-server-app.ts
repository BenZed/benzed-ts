
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

import { HookContext } from '@feathersjs/feathers'

/*** Types ***/

type FileServerApp = MongoDBApplication<FileServices, FileServerConfig>

type FileServerHookContext<S extends FileServices[keyof FileServices]> = 
    HookContext<FileServerApp, S>

/*** Main ***/

function createFileServerApp(config?: FileServerConfig): FileServerApp {

    const fileServerApp = createMongoDBApplication<FileServices, FileServerConfig>(
        config ?? $fileServerConfig
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
