import { milliseconds } from '@benzed/async'

import type {
    Db,
    ObjectId,
    Collection
} from 'mongodb'

import { MongoClient } from 'mongodb'

import type {
    MongoDBApplication,
    MongoDBApplicationConfig
} from './create-mongo-db-application'

import { $, Infer } from '@benzed/schema'

import { $port } from '../schemas/util'

/*** Constants ***/

const DEFAULT_MONGODB_PORT = 27017

/*** Exports ***/

const $mongoDBConfig = $.shape({

    uri: $.string,
    database: $.string,

    port: $port.default(DEFAULT_MONGODB_PORT),

    user: $.string.optional,
    password: $.string.optional,
})

/**
 * Items required for mongodb
 */
interface MongoDBConfig extends Infer<typeof $mongoDBConfig> {}

/*** Main ***/

export default function setupMongoDB<S, C extends MongoDBApplicationConfig>(
    app: MongoDBApplication<S, C>
): void {

    const config = app.get(`db`) as any

    const uri = config.uri
        .replaceAll(`<port>`, config.port.toString())
        .replaceAll(`<user>`, config.user ?? ``)
        .replaceAll(`<password>`, config.password ?? ``)
        .replaceAll(`<database>`, config.database)

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
    
    $mongoDBConfig,
    MongoDBConfig,

    ObjectId,
    Db
}
