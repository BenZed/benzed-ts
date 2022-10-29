import { $, Infer } from '@benzed/schema'

import { $logIcon, $port } from "../schemas"
import { Module, ModuleSetting } from "../module"

import { 
    MongoClient as _MongoClient, 
    Db as _MongoDatabase, 
    ObjectId
} from 'mongodb'

import { DEFAULT_MONGODB_PORT } from '../constants'

/*** Eslint ***/

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
*/

/*** Base ***/

type Id = { _id: string }

/**
 * Just in case I intend to add support for more databases later,
 * they should all have the same interface
 */
abstract class Database<S extends ModuleSetting> extends Module<S> {

    override validateModules(): void {
        this._assertRoot()
        this._assertSingle()
    }

    abstract getCollection<T extends Id, Q extends object>(collection: string): Collection<T, Q> 

}

abstract class Collection<T extends Id, Q extends object> {

    abstract get(id: Id['_id']): Promise<T | null> 

    // abstract find(query: Q): Promise<T> 

    abstract create(data: Omit<T, '_id'>): Promise<T>

    // abstract remove(data: T): Promise<T>

    // abstract update(id: Id['_id'], data: T): Promise<T>

}

/*** Types ***/

interface MongoDbSettings extends Infer<typeof $mongoDbSettings>{}

const $mongoDbSettings = $.shape({

    uri: $.string,
    database: $.string,

    port: $port.default(DEFAULT_MONGODB_PORT),

    user: $.string.optional,
    password: $.string.optional,

    logIcon: $logIcon.default(`🗄️`)

})

/*** MongoDb ***/

class MongoDbCollection<T extends Id, Q extends object> extends Collection<T, Q> {

    constructor(
        readonly _collection: any // < mongod types are absolutely fucked
    ) {
        super()
    }

    async get(id: Id['_id']): Promise<T | null> {
        const result = await this._collection.findOne(new ObjectId(id))

        return result && { 
            ...result,
            _id: result._id.toString()
        }
    }

    async create(data: Omit<T, '_id'>): Promise<T & Id> {

        const { insertedId } = await this._collection.insertOne(data)

        return this.get(insertedId.toString()) as Promise<T & Id>
    }

}

class MongoDb extends Database<Required<MongoDbSettings>> {

    // Static Create with Schema Validation

    static create(settings: MongoDbSettings): MongoDb {
        return new MongoDb(
            $mongoDbSettings.validate(settings) as Required<MongoDbSettings>
        )
    }

    constructor(
        settings: Required<MongoDbSettings>
    ) {
        super(settings)
    }

    // Module Implementation

    private _mongoClient: _MongoClient | null = null
    private _db: _MongoDatabase | null = null 

    override async start(): Promise<void> {

        const { settings } = this

        const uri = settings.uri
            .replaceAll(`<port>`, settings.port.toString())
            .replaceAll(`<user>`, settings.user ?? ``)
            .replaceAll(`<password>`, settings.password ?? ``)
            .replaceAll(`<database>`, settings.database)

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

    // Database Implementation

    getCollection<T extends Id, Q extends object>(collection: string): MongoDbCollection<T, Q> {

        if (!this._db)
            throw new Error(`${this.constructor.name} is not connected.`)

        return new MongoDbCollection<T, Q>(
            this._db.collection(collection)
        )
    }
    
}

/*** Exports ***/

export {
    MongoDb,
    MongoDbSettings,
    $mongoDbSettings,

    DEFAULT_MONGODB_PORT
}