import {
    createMongoDBApplication,
    MongoDBApplication,

    $mongoDBApplicationConfig,
    $pagination,
    
} from '@benzed/feathers'
import { $rendererConfig } from '@benzed/renderer'
import $, { Infer } from '@benzed/schema'
import '@benzed/util'

import { HookContext } from '@feathersjs/feathers'

import services, { FileServices } from './services'
import { $fileServiceConfig } from './schemas'
import middleware from './middleware'

/*** Types ***/

interface FileServerConfig extends Infer<typeof $fileServerConfig> {}
const $fileServerConfig = $({
    
    ...$mongoDBApplicationConfig.$,

    s3: $fileServiceConfig.$.s3,
    fs: $fileServiceConfig.$.fs,

    pagination: $pagination,
    renderer: $rendererConfig,
    authentication: $.object,

})

interface FileServerApp extends MongoDBApplication<FileServices, FileServerConfig> {}

interface FileServerHookContext<S extends FileServices[keyof FileServices]> extends
    HookContext<FileServerApp, S> {}

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
