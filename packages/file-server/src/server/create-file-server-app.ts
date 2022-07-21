import { feathers, HookContext } from '@feathersjs/feathers'

import express, {
    Application as ExpressApplication,
    json,
    urlencoded,
    rest
} from '@feathersjs/express'

import configuration from '@feathersjs/configuration'

import helmet from 'helmet'
import cors from 'cors'
import compress from 'compression'

import { Logger, createLogger } from '@benzed/util'

import services from './services'
import middleware from './middleware'

/*** Types ***/

interface FileServerConfig {
    port: number
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface FileServices { /**/ }

interface FileServerApp extends ExpressApplication<FileServices, FileServerConfig> {
    log: Logger
}

type FileServerHookContext = HookContext<FileServerApp, FileServices>

/*** Main ***/

function createFileServerApp(): FileServerApp {

    //
    const app = Object.assign(

        express(feathers()) as ExpressApplication<FileServices, FileServerConfig>,

        {
            log: createLogger({ header: '🗄️' })
        }

    )

    app.configure(configuration())

    const CORS_OPTIONS = { origin: '*' } as const

    app.use(helmet())
    app.use(cors(CORS_OPTIONS))
    app.use(compress())
    app.use(json())
    app.use(urlencoded({ extended: true }))

    app.configure(rest())
    app.configure(services)
    app.configure(middleware)

    return app
}

/*** Exports ***/

export default createFileServerApp

export {

    createFileServerApp,

    FileServerApp,
    FileServerConfig,
    FileServerHookContext,
    FileServices

}
