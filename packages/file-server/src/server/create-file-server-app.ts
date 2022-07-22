import { feathers, HookContext } from '@feathersjs/feathers'
import configuration from '@feathersjs/configuration'
import express, {
    Application as ExpressApplication,
    json,
    urlencoded,
    rest
} from '@feathersjs/express'

import helmet from 'helmet'
import cors from 'cors'
import compress from 'compression'

import { Logger, createLogger } from '@benzed/util'

import services from './services'
import middleware from './middleware'

/*** Types ***/

interface FileServerSettings {
    port: number
    env: 'production' | 'development' | 'test'
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface FileServices { }

interface FileServerApp extends ExpressApplication<FileServices, FileServerSettings> {
    log: Logger
    start(): Promise<void>
}

type FileServerHookContext = HookContext<FileServerApp, FileServices>

/*** Constants ***/

const CORS_OPTIONS = { origin: '*' } as const

/*** Helper ***/

function applyFileServerAppAddons(
    feathersApp: ExpressApplication<FileServices, FileServerSettings>
): FileServerApp {

    const log = createLogger({
        header: '⚙️',
        timeStamp: true,
        onLog: feathersApp.get('env') === 'test'
            ? () => {/* no logging in test mode */ }
            : console.log.bind(console)
    })

    const start = async function start(this: FileServerApp): Promise<void> {

        const env = this.get('env')
        const port = this.get('port')

        await this.listen(port)

        this.log`file server listening on port ${port} in ${env} mode`
    }

    return Object.assign(feathersApp, {
        log,
        start,
    })
}

/*** Main ***/

function createFileServerApp(): FileServerApp {

    const feathersApp = express(feathers()) as ExpressApplication<FileServices, FileServerSettings>

    feathersApp.configure(configuration())
    feathersApp.use(helmet())
    feathersApp.use(cors(CORS_OPTIONS))
    feathersApp.use(compress())
    feathersApp.use(json())
    feathersApp.use(urlencoded({ extended: true }))

    const fileServerApp = applyFileServerAppAddons(feathersApp)
    fileServerApp.configure(rest())
    fileServerApp.configure(services)
    fileServerApp.configure(middleware)

    return fileServerApp
}

/*** Exports ***/

export default createFileServerApp

export {

    createFileServerApp,

    FileServerApp,
    FileServerSettings,
    FileServerHookContext,
    FileServices

}
