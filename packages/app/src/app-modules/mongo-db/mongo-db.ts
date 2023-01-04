import { Module} from '@benzed/ecs'
import { Guarantee } from '@benzed/async'

import { 
    MongoClient as _MongoClient, 
    Db as _MongoDatabase,
} from 'mongodb'

import { 
    $mongoDbSettings,
    MongoDbSettings 
} from './mongo-db-settings'

import MongoDbCollection from './mongo-db-collection'

import { AppModule } from '../../app-module'
import { Json, SchemaHook } from '../../util'

//// Eslint ////

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
    @typescript-eslint/ban-types
*/

//// Mongodb Database ////

class MongoDb extends AppModule<Required<MongoDbSettings>> {

    static readonly icon = '🗃️'

    // Static Create with Schema Validation

    static create(settings: MongoDbSettings): MongoDb {
        return new MongoDb(
            $mongoDbSettings.validate(settings) as Required<MongoDbSettings>
        )
    }

    // Module Implementation

    private readonly _connect = new Guarantee(async () => {
        const { data } = this 
        const uri = data.uri
            .replaceAll('<port>', data.port.toString())
            .replaceAll('<user>', data.user ?? '')
            .replaceAll('<password>', data.password ?? '')
            .replaceAll('<database>', data.database)

        const client = await _MongoClient.connect(uri)

        this.log`mongodb connected ${{ uri }}`

        return client
    })

    /**
     * @internal
     */
    get _database(): _MongoDatabase {
        if (!this.isConnected)
            console.log(this._connect)
        if (!this.isConnected)
            throw new Error(`${this.name} is not connected`)

        return this._connect.value.db(this.data.database)
    }

    override async start(): Promise<void> {
        await super.start()
        await this._connect()
    }

    override async stop(): Promise<void> {
        
        await super.stop()

        if (!this._connect.isIdle) {
            const client = await this._connect()
            client.close()
        }
    
        this._connect.reset()
        this.log`mongodb disconnected`
    }

    override validate(): void {
        Module.assert.isSingle(this)
    }

    get isConnected(): boolean {
        return this._connect.isFulfilled
    }

    createCollection<N extends string, T extends Json>(
        name: N, 
        schema: SchemaHook<T>
    ): MongoDbCollection<N,T> {
        return MongoDbCollection.create(name, schema)
    }

    async clearAllCollections(): Promise<void> {
        this._assertStarted()  

        const collections = this.node.findModules.inSelf.or.inDescendents(MongoDbCollection)
        for (const collection of collections) 
            await collection.clear()
        
    }

}

//// Exports ////

export {

    MongoDb,

    MongoDbSettings,
    $mongoDbSettings

}