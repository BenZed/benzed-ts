
import compress from 'compression'
import helmet from 'helmet'
import cors from 'cors'

import type { Db } from 'mongodb'

import { feathers } from '@feathersjs/feathers'
import configuration from '@feathersjs/configuration'
import socketio from '@feathersjs/socketio'
import express, {
    Application as ExpressApplication,
    json,
    urlencoded,
    rest,
} from '@feathersjs/express'

import { createLogger, Logger } from '@benzed/util'

import setupMongoDb, { MongoDbConfig } from './setup-mongo-db'
import defaultSetupChannels from './setup-channels'

import { Schema } from '../schemas'
import { disallowAll } from '../hooks'

/*** Types ***/

export interface MongoApplicationConfig {
    name: string
    port: number
    env: 'production' | 'development' | 'test'
    db: MongoDbConfig
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface MongoApplication<S = any, C = any>
    extends ExpressApplication<S, C> {
    log: Logger
    db(): Db
    start(): Promise<void>
}

/*** Helper ***/

function applyMongoAddons<S, C extends MongoApplicationConfig>(
    expressApp: ExpressApplication<S, C>

): MongoApplication<S, C> {

    const log = createLogger({
        header: '⚙️',
        timeStamp: true,
        onLog: expressApp.get('env') === 'test'
            ? () => {/* no logging in test mode */ }
            : console.log.bind(console)
    })

    const db = function db(): Db {
        throw new Error('MongoDb not yet configured')
    }

    const start = async function start(this: MongoApplication<S, C>): Promise<void> {

        const name = this.get('name')
        const env = this.get('env')
        const port = this.get('port')

        await this.listen(port)

        this.log`${name} listening on port ${port} in ${env} mode`
    }

    return Object.assign(expressApp, { log, db, start }) as MongoApplication<S, C>
}

/*** Main ***/

export function createMongoApplication<S, C extends MongoApplicationConfig>(
    setup: {
        services: (app: MongoApplication<S, C>) => void
        middleware: (app: MongoApplication<S, C>) => void
        channels?: (app: MongoApplication<S, C>) => void
        configSchema?: Schema<C>
    }
): MongoApplication<S, C> {

    const {
        channels: setupChannels = defaultSetupChannels,
        middleware: setupMiddleware,
        services: setupServices
    } = setup

    const CORS_OPTIONS = { origin: '*' } as const

    // Create feathers instance and configure it
    const feathersApp = feathers()
    feathersApp.configure(configuration())
    feathersApp.configure(socketio({
        cors: CORS_OPTIONS
    }))
    feathersApp.hooks({
        update: [disallowAll] // disable update method, use patch instead
    })

    // Wrap in express instance, configure

    const expressApp = express(feathersApp)

    // standard express middleware
    const IS_PRODUCTION = expressApp.get('env') === 'production'
    if (IS_PRODUCTION) {
        expressApp.use(
            helmet({
                contentSecurityPolicy: false,
                crossOriginEmbedderPolicy: false
            })
        )
    }

    expressApp.use(cors(CORS_OPTIONS))
    expressApp.use(compress())
    expressApp.use(json())
    expressApp.use(urlencoded({ extended: true }))

    // providers
    expressApp.configure(rest())

    // Add Mongo addons
    const mongoApp = applyMongoAddons(expressApp)
    mongoApp.configure(setupMongoDb)
    mongoApp.configure(setupServices)
    mongoApp.configure(setupChannels)
    mongoApp.configure(setupMiddleware)

    return mongoApp
}