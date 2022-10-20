import '@benzed/util'
import {

    createMongoDBApplication,
    MongoDBApplication,

    $mongoDBApplicationConfig,
    $pagination,

} from '@benzed/feathers'
import $, { Infer } from '@benzed/schema'

import { HookContext } from '@feathersjs/feathers'

import services, { FileServices } from './services'

import { $fileServiceConfig } from '../files-service/schema'
import { $renderServiceConfig } from '../render-service/schema'

import socketio from './socket-io'

/*** Types ***/

interface FileServerConfig extends Infer<typeof $fileServerConfig> { }

const $fileServerConfig = $({

    ...$mongoDBApplicationConfig.$,

    s3: $fileServiceConfig.$.s3,
    fs: $fileServiceConfig.$.fs,
    renderer: $.or(
        $renderServiceConfig.$.renderer,
        $.null
    ),

    pagination: $pagination,
    authentication: $.object,

})

interface FileServerApp extends MongoDBApplication<FileServices, FileServerConfig> {}

interface FileServerHookContext<S extends FileServices[keyof FileServices]> extends
    HookContext<FileServerApp, S> {}

/*** Main ***/

function createFileServerApp(config?: FileServerConfig): FileServerApp {

    const fileServerApp = createMongoDBApplication<FileServices, FileServerConfig>(
        config ? $fileServerConfig.validate(config) : $fileServerConfig
    )

    fileServerApp.configure(socketio)
    fileServerApp.configure(services)

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
