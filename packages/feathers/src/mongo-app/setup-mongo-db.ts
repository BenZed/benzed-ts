import {
    MongoClient,
    Db,
    ObjectId
} from 'mongodb'

import type {
    MongoApplication,
    MongoApplicationConfig
} from './create-mongo-application'

/*** Constants ***/

const DEFAULT_MONGODB_PORT = 27017

/*** Types ***/

interface MongoDbConfig {
    uri: string
    database: string

    port?: number
    user?: string
    password?: string
}

/*** Helper ***/

function isMongoDbConfig(input: unknown): input is MongoDbConfig {

    //
    if (
        input == null ||
        typeof input !== 'object'
    )
        return false

    const config = input as MongoDbConfig

    return typeof config.uri === 'string' &&
        typeof config.database === 'string' &&
        ['undefined', 'number'].includes(typeof config.port) &&
        ['undefined', 'string'].includes(typeof config.user) &&
        ['undefined', 'string'].includes(typeof config.password)
}

/*** Main ***/

export default function setupMongoDb<S, C extends MongoApplicationConfig>(
    app: MongoApplication<S, C>
): void {

    const config = app.get('db')
    if (!isMongoDbConfig(config))
        throw new Error('config.mongodb is invalid.')

    const uri = config.uri
        .replace('<port>', (config.port ?? DEFAULT_MONGODB_PORT).toString())
        .replace('<user>', config.user ?? '')
        .replace('<password>', config.password ?? '')
        .replace('<database>', config.database)

    app.log`mongodb initialized ${{ uri }}`

    // Create stateful mongo connection
    let mongo: MongoClient

    // Amend mongo connection helper
    app.db = function db(): Db {
        if (mongo)
            return mongo.db(config.database)

        throw new Error('MongoDb is not yet connected.')
    }

    // Amend setup to connect on start
    const { setup, teardown } = app

    app.setup = async function mongoDbSetup(
        this: MongoApplication<S, C>
    ): Promise<MongoApplication<S, C>> {

        mongo = await MongoClient.connect(uri)

        this.log`mongodb connected ${{ uri }}`

        return setup.call(this, this.server)
    }

    app.teardown = async function mongoDbTeardown(
        this: MongoApplication<S, C>
    ): Promise<MongoApplication<S, C>> {

        await mongo?.close()

        return teardown.call(this, this.server)
    }

}

export {

    setupMongoDb,
    MongoDbConfig,
    isMongoDbConfig,

    ObjectId,
    Db
}