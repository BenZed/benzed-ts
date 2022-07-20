import { feathers, Application, HookContext } from '@feathersjs/feathers'
import express, { json, urlencoded, rest } from '@feathersjs/express'
import configuration from '@feathersjs/configuration'
import socketio from '@feathersjs/socketio'

import helmet from 'helmet'
import cors from 'cors'
import compress from 'compression'
import type { Express } from 'express'

import { Logger, createLogger } from '@benzed/util'

import services from './services'
import middleware from './middleware'
import channels from './channels'

/*** Types ***/

interface FileServerConfig {
    port: number
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface FileServices {
    //
}

type FileServerApp =
    Express &
    Application<FileServices, FileServerConfig> &
    {
        log: Logger
    }

type FileServerHookContext = HookContext<FileServerApp, FileServices>

/*** Main ***/

function createFileServerApp(): FileServerApp {

    //
    const app = Object.assign(

        express(feathers()) as Express & Application<FileServices, FileServerConfig>,

        {
            log: createLogger({
                header: '🗄️'
            })
        }

    )

    app.configure(configuration())

    const CORS_OPTIONS = { origin: '*' } as const

    app.use(helmet())
    app.use(cors(CORS_OPTIONS))
    app.use(compress())
    app.use(json())
    app.use(urlencoded())

    app.configure(socketio({ cors: CORS_OPTIONS }))
    app.configure(channels)

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
