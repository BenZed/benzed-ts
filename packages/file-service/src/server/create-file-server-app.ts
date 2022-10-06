
import {
    createMongoDBApplication,
    MongoDBApplication,

    $mongoDBApplicationConfig,
    $pagination,
    
} from '@benzed/feathers'

import $, { Infer } from '@benzed/schema'

import { HookContext } from '@feathersjs/feathers'

import services, { FileServices } from './services'
import middleware from './middleware'

import { $fileServiceConfig } from './schemas'
import { $rendererConfig } from '@benzed/renderer/lib'

/*** Types ***/

type FileServerConfig = Infer<typeof $fileServerConfig>
const $fileServerConfig = $({
    
    ...$mongoDBApplicationConfig.$,

    ...$fileServiceConfig.$,

    pagination: $pagination,
    renderer: $rendererConfig,
    authentication: $.object(),

})

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
    FileServerHookContext,

    $fileServerConfig,
    FileServerConfig
}
