
import type { Db } from 'mongodb'

import { feathers } from '@feathersjs/feathers'
import configuration from '@feathersjs/configuration'
import {
    koa,
    rest,
    bodyParser,
    errorHandler,
    parseAuthentication,

    Application as KoaApplication
} from '@feathersjs/koa'

import { createLogger, Logger } from '@benzed/util'

import setupMongoDb, { MongoDbConfig } from './setup-mongo-db'

import { Schema } from '../schemas'
import { disallowAll } from '../hooks'

/*** Types ***/

export interface MongoApplicationConfig {
    name: string
    port: number
    db: MongoDbConfig
}

type Env = 'test' | 'development' | 'production'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface MongoApplication<S = any, C = any> extends KoaApplication<S, C> {

    log: Logger

    db(): Db

    start(): Promise<void>

    mode(): Env
}

/*** Helper ***/

function applyMongoAddons<S, C extends MongoApplicationConfig>(
    expressApp: KoaApplication<S, C>
): MongoApplication<S, C> {

    const mode = function mode(): Env {
        return (process.env.NODE_ENV ?? 'development') as Env
    }

    const log = createLogger({
        header: '⚙️',
        timeStamp: true,
        onLog: mode() === 'test'
            ? () => { /* no logging in test mode */ }
            : console.log.bind(console)
    })

    const db = function db(): Db {
        throw new Error('MongoDb not yet configured')
    }

    const start = async function start(this: MongoApplication<S, C>): Promise<void> {

        const name = this.get('name')
        const port = this.get('port')
        const env = this.mode()

        await this.listen(port)

        this.log`${name} listening on port ${port} in ${env} mode`
    }

    return Object.assign(
        expressApp,
        { log, db, mode, start }
    ) as MongoApplication<S, C>
}

/*** Main ***/

export default function createMongoApplication<S, C extends MongoApplicationConfig>(
    setup?: {
        services?: (app: MongoApplication<S, C>) => void
        middleware?: (app: MongoApplication<S, C>) => void
        channels?: (app: MongoApplication<S, C>) => void
        configSchema?: Schema<C>
    }
): MongoApplication<S, C> {

    const {
        configSchema
    } = setup ?? {}

    // Create feathers instance and configure it
    const mongoApp = applyMongoAddons(koa(feathers()))

    mongoApp.configure(configuration(configSchema))
    mongoApp.use(errorHandler())
    mongoApp.use(parseAuthentication())
    mongoApp.use(bodyParser())

    mongoApp.configure(rest())
    mongoApp.configure(setupMongoDb)

    mongoApp.hooks({
        update: [disallowAll] // disable update method, use patch instead
    })

    return mongoApp
}

export { createMongoApplication }