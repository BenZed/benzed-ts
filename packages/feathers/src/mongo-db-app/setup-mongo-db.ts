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

/*** Main ***/

export default function setupMongoDB<S, C extends MongoDBApplicationConfig>(
    app: MongoDBApplication<S, C>
): void {

    const config = app.get('db')

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

    ObjectId,
    Db
}

export { MongoDBConfig } from './schemas'