
import type { Collection } from 'mongodb'
import type { Schema } from '../schemas'

import { feathers } from '@feathersjs/feathers'
import configuration from '@feathersjs/configuration'
import {
    koa,
    rest,
    bodyParser,
    errorHandler,
    parseAuthentication as authParser,

    Application as KoaApplication
} from '@feathersjs/koa'

import { createLogger, Logger } from '@benzed/util'

import setupMongoDB, { MongoDBConfig } from './setup-mongo-db'

/*** Types ***/

export interface MongoDBApplicationConfig {
    name: string
    port: number
    db: MongoDBConfig
}

type Env = 'test' | 'development' | 'production'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface MongoDBApplication<S = any, C = any> extends KoaApplication<S, C> {

    log: Logger

    /**
     * Retreive a database collection after the app has connected to the database
     * @param collection 
     */
    db(collection: string): Promise<Collection>

    start(): Promise<void>

    mode(): Env
}

/*** Helper ***/

function applyMongoAddons<S, C extends MongoDBApplicationConfig>(
    expressApp: KoaApplication<S, C>
): MongoDBApplication<S, C> {

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

    const db = function db(_collection: string): Promise<Collection> {
        return Promise.reject(new Error('MongoDb not yet configured'))
    }

    const start = async function start(this: MongoDBApplication<S, C>): Promise<void> {

        const name = this.get('name')
        const port = this.get('port')
        const env = this.mode()

        await this.listen(port)

        this.log`${name} listening on port ${port} in ${env} mode`
    }

    return Object.assign(
        expressApp,
        { log, db, mode, start }
    ) as MongoDBApplication<S, C>
}

/*** Main ***/

export default function createMongoDBApplication<S, C extends MongoDBApplicationConfig>(
    configSchema?: Schema<C>
): MongoDBApplication<S, C> {

    // Create feathers instance and configure it
    const mongoApp = applyMongoAddons(koa(feathers()))

    mongoApp.configure(configuration(configSchema))
    mongoApp.configure(setupMongoDB)
    mongoApp.configure(rest())

    mongoApp.use(errorHandler())
    mongoApp.use(authParser())
    mongoApp.use(bodyParser())

    return mongoApp
}

export { createMongoDBApplication }