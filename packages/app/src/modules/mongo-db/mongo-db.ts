import { KeysOf, nil } from '@benzed/util'
import { Modules } from '@benzed/ecs'

import { 
    MongoClient as _MongoClient, 
    Db as _MongoDatabase,
} from 'mongodb'

import { SchemaHook } from '../../util'
import { AppModule } from '../../app-module'

import { 
    $mongoDbSettings,
    MongoDbSettings 
} from './mongo-db-settings'

import MongoDbCollection from './mongo-db-collection'

//// Eslint ////

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
    @typescript-eslint/ban-types
*/

//// Collections ////

type Collections = {
    readonly [key: string]: MongoDbCollection<any>
}

type AddCollection<C extends Collections, N extends string, Cx extends MongoDbCollection<any>> = 
    ({ [K in N | KeysOf<C>]: K extends N ? Cx : C[K] }) extends infer A 
        ? A extends Collections 
            ? A 
            : never 
        : never

//// Mongodb Database ////

class MongoDb<C extends Collections> extends AppModule<Required<MongoDbSettings>> {

    static readonly icon = '🗃️'

    // Static Create with Schema Validation

    static create(settings: MongoDbSettings): MongoDb<{}> {
        return new MongoDb(
            $mongoDbSettings.validate(
                settings
            ) as Required<MongoDbSettings>,
            {}
        )
    }

    private constructor(
        settings: Required<MongoDbSettings>,
        private readonly _collections: C
    ) {
        super(settings)
    }

    // Module Implementation

    private _mongoClient: _MongoClient | nil = nil
    private _db: _MongoDatabase | nil = nil

    override async start(): Promise<void> {

        await super.start()
        const { data } = this

        const uri = data.uri
            .replaceAll('<port>', data.port.toString())
            .replaceAll('<user>', data.user ?? '')
            .replaceAll('<password>', data.password ?? '')
            .replaceAll('<database>', data.database)

        this._mongoClient = await _MongoClient.connect(uri)
        this._db = this._mongoClient.db(data.database)

        this.log`mongodb connected ${{ uri }}`
    }

    override async stop(): Promise<void> {
        
        await super.stop()
        if (!this._mongoClient) 
            return 

        await this._mongoClient.close()

        this._mongoClient = nil
        this._db = nil

        this.log`mongodb disconnected`
    }

    override validate(): void {
        Modules.assert.isSingle(this)
    }

    // Database Implementation

    get collections(): C {
        return this._collections
    }

    getCollection<N extends KeysOf<C>>(name: N): C[N]
    getCollection<T extends object>(name: string): MongoDbCollection<T> {

        const collection = this._getCollection(name as KeysOf<C>)

        this._assertConnected(this._db)

        if (!collection.connected)
            collection._connect(this._db.collection(name))

        return collection
    }

    addCollection<N extends string, T extends object>(
        name: N, 
        schematic: SchemaHook<T>
    ): MongoDb<AddCollection<C, N, MongoDbCollection<T>>> {

        if (!name)
            throw new Error('Collection name must not be empty.')

        if (name in this._collections)
            throw new Error(`Collection '${name}' already exists.`)

        const collections = {
            ...this._collections,
            [name as N]: new MongoDbCollection<T>(schematic)
        } as unknown as AddCollection<C, N, MongoDbCollection<T>>

        return new MongoDb(
            this.data,
            collections
        )
    }

    async clearCollection<N extends KeysOf<C>>(collectionName: N): Promise<void> {
        this._assertStarted()
        this._assertConnected(this._db)
        this._assertCollection(collectionName)

        const _mongoCollection = this._db.collection(collectionName)
        await _mongoCollection.deleteMany({})

        this.log`cleared collection ${collectionName}`
    }

    async clearAllCollections(): Promise<void> {
        for (const name in this._collections) 
            await this.clearCollection(name)  
    }

    //// Helper ////

    private _getCollection<N extends KeysOf<C>>(name: N): C[N]
    private _getCollection<T extends object>(name: string): MongoDbCollection<T> {
        this._assertCollection(name)
        return this._collections[name]
    }

    private _assertCollection(name: string): void {
        if (!this._collections[name])
            throw new Error(`Collection '${name}' does not exist.`)
    }

    private _assertConnected(db: _MongoDatabase | nil): asserts db is _MongoDatabase {
        if (!db)
            throw new Error(`${this.name} not connecteed`)
    }

}

//// Exports ////

export {

    MongoDb,

    MongoDbSettings,
    $mongoDbSettings

}