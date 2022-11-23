import { StringKeys } from '@benzed/util'
import { SchemaFor } from '@benzed/schema'

import { 
    MongoClient as _MongoClient, 
    Db as _MongoDatabase, 
} from 'mongodb'

import { 
    SettingsModule 
} from '../../module'

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
    ({ [K in N | StringKeys<C>]: K extends N ? Cx : C[K] }) extends infer A 
        ? A extends Collections 
            ? A 
            : never 
        : never

//// Mongodb Database ////

class MongoDb<C extends Collections> extends SettingsModule<Required<MongoDbSettings>> {

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

    private _mongoClient: _MongoClient | null = null
    private _db: _MongoDatabase | null = null 

    override async start(): Promise<void> {

        const { settings } = this

        const uri = settings.uri
            .replaceAll('<port>', settings.port.toString())
            .replaceAll('<user>', settings.user ?? '')
            .replaceAll('<password>', settings.password ?? '')
            .replaceAll('<database>', settings.database)

        this._mongoClient = await _MongoClient.connect(uri)
        this._db = this._mongoClient.db(settings.database)

        this.log`mongodb connected ${{ uri }}`
    }

    override async stop(): Promise<void> {
        
        if (!this._mongoClient) 
            return 

        await this._mongoClient.close()

        this._mongoClient = null
        this._db = null

        this.log`mongodb disconnected`
    }

    override _validateModules(): void {
        this._assertSingle()
    }

    // Database Implementation

    get collections(): C {
        return this._collections
    }

    getCollection<N extends StringKeys<C>>(name: N): C[N] {

        if (!this._db)
            throw new Error(`${this.name} is not connected.`)

        const collection = this._collections[name] as C[N] | undefined
        if (!collection)
            throw new Error(`Collection '${name}' does not exist.`)

        if (!collection.connected)
            collection._connect(this._db.collection(name))

        return collection
    }

    addCollection<N extends string, T extends object>(
        name: N, 
        schema: SchemaFor<T>
    ): MongoDb<AddCollection<C, N, MongoDbCollection<T>>> {

        if (!name)
            throw new Error('Collection name must not be empty.')

        if (name in this._collections)
            throw new Error(`Collection '${name}' already exists.`)

        const collections = {
        
            ...this._collections,
            [name as N]: new MongoDbCollection<T>(schema)
        
        } as unknown as AddCollection<C, N, MongoDbCollection<T>>

        return new MongoDb(
            this.settings,
            collections
        )
    }

}

//// Exports ////

export {

    MongoDb,

    MongoDbSettings,
    $mongoDbSettings

}