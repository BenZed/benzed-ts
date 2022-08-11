
import compress from 'compression'
import helmet from 'helmet'
import cors from 'cors'

import type { Db } from 'mongodb'

import { feathers, Application as FeathersApplication } from '@feathersjs/feathers'
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

export default function createMongoApplication<S, C extends MongoApplicationConfig>(
    setup: {
        services?: (app: MongoApplication<S, C>) => void
        middleware?: (app: MongoApplication<S, C>) => void
        channels?: (app: MongoApplication<S, C>) => void
        configSchema?: Schema<C>
    }
): MongoApplication<S, C> {

    const {
        channels: setupChannels = defaultSetupChannels,
        middleware: setupMiddleware,
        services: setupServices,
        configSchema
    } = setup

    const CORS_OPTIONS = { origin: '*' } as const

    // Create feathers instance and configure it
    const mongoApp = applyMongoAddons(express(feathers()))
    const feathersApp = mongoApp as FeathersApplication
    const expressApp = mongoApp as ExpressApplication

    feathersApp.configure(configuration(configSchema))
    feathersApp.configure(socketio({
        cors: CORS_OPTIONS
    }))
    mongoApp.configure(setupChannels)
    feathersApp.hooks({
        update: [disallowAll] // disable update method, use patch instead
    })

    // standard express middleware
    const IS_PRODUCTION = mongoApp.get('env') === 'production'
    if (IS_PRODUCTION) {
        mongoApp.use(
            helmet({
                contentSecurityPolicy: false,
                crossOriginEmbedderPolicy: false
            })
        )
    }

    mongoApp.use(cors(CORS_OPTIONS))
    mongoApp.use(compress())
    mongoApp.use(json())
    mongoApp.use(urlencoded({ extended: true }))

    // providers
    expressApp.configure(rest())

    // Add Mongo addons
    mongoApp.configure(setupMongoDb)
    if (setupServices)
        mongoApp.configure(setupServices)
    if (setupMiddleware)
        mongoApp.configure(setupMiddleware)

    return mongoApp
}

export {
    createMongoApplication
}