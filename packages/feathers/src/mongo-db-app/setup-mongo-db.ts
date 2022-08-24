import { milliseconds } from '@benzed/async'

import {
    MongoClient,
    Db,
    ObjectId,
    Collection
} from 'mongodb'

import type {
    MongoDBApplication,
    MongoDBApplicationConfig
} from './create-mongo-db-application'

/*** Constants ***/

const DEFAULT_MONGODB_PORT = 27017

/*** Types ***/

interface MongoDBConfig {
    uri: string
    database: string

    port?: number
    user?: string
    password?: string
}

/*** Helper ***/

function isMongoDbConfig(input: unknown): input is MongoDBConfig {

    if (
        input == null ||
        typeof input !== 'object'
    )
        return false

    const config = input as MongoDBConfig

    return typeof config.uri === 'string' &&
        typeof config.database === 'string' &&
        ['undefined', 'number'].includes(typeof config.port) &&
        ['undefined', 'string'].includes(typeof config.user) &&
        ['undefined', 'string'].includes(typeof config.password)
}

/*** Main ***/

export default function setupMongoDB<S, C extends MongoDBApplicationConfig>(
    app: MongoDBApplication<S, C>
): void {

    const config = app.get('db')
    if (!isMongoDbConfig(config))
        throw new Error('config.mongodb is invalid.')

    const uri = config.uri
        .replaceAll('<port>', (config.port ?? DEFAULT_MONGODB_PORT).toString())
        .replaceAll('<user>', config.user ?? '')
        .replaceAll('<password>', config.password ?? '')
        .replaceAll('<database>', config.database)

    app.log`mongodb initialized ${{ uri }}`

    // Create stateful mongo connection
    let connection: Promise<MongoClient> | MongoClient | null = null

    // Amend mongo connection helper
    app.db = async function db(collection: string): Promise<Collection> {

        while (connection === null)
            await milliseconds(250)

        return (await connection)
            .db(config.database)
            .collection(collection)

    }

    // Amend setup to connect on start
    const { setup, teardown } = app

    app.setup = async function mongoDbSetup(
        this: MongoDBApplication<S, C>
    ): Promise<MongoDBApplication<S, C>> {

        connection = MongoClient.connect(uri)
        connection = await connection

        this.log`mongodb connected ${{ uri }}`

        return setup.call(this, this.server)
    }

    app.teardown = async function mongoDbTeardown(
        this: MongoDBApplication<S, C>
    ): Promise<MongoDBApplication<S, C>> {

        if (connection) {
            connection = await connection
            await connection.close()
        }

        return teardown.call(this, this.server)
    }

}

export {

    setupMongoDB,
    MongoDBConfig,
    isMongoDbConfig,

    ObjectId,
    Db
}