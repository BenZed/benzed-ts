import { $, Infer } from '@benzed/schema'

import { $logIcon, $port } from "../schemas"
import { SettingsModule } from '../module'

import { 
    MongoClient as _MongoClient, 
    Db as _MongoDatabase, 
    ObjectId
} from 'mongodb'

import { DEFAULT_MONGODB_PORT } from '../constants'
import { Empty } from '@benzed/util'

//// Eslint ////

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
*/

//// Base ////

type Id = string
type Record<T extends object> = T & { _id: Id }
type Paginated<T extends object> = {
    total: number
    records: Record<T>[]
    // skip: number 
    // limit: number
}

type CreateData<T extends object> = T
type UpdateData<T extends object> = Partial<T>
type FindQuery<T extends object> = Empty // { [K in keyof T]: ...etc }

/**
 * Just in case I intend to add support for more databases later,
 * they should all have the same interface
 */
abstract class Database<S extends object> extends SettingsModule<S> {

    override _validateModules(): void {
        this._assertRoot()
        this._assertSingle()
    }

    abstract getCollection<T extends object>(collection: string): Collection<T> 

}

abstract class Collection<T extends object> {

    /**
     * Returns a record if it exists, null otherwise.
     */
    abstract get(id: Id): Promise<Record<T> | null> 

    abstract find(query: FindQuery<T>): Promise<Paginated<T>> 

    /**
     * Adds a record to the collection, returns the given data 
     * with the inserted id.
     */
    abstract create(data: CreateData<T>): Promise<Record<T>>

    /**
     * Removes the record within the collection and returns it.
     * Returns null if there was no record to remove.
     */
    abstract remove(id: Id): Promise<Record<T> | null>

    /**
     * Updates the record within the collection and returns it.
     * Returns null if there was no record to update. 
     */
    abstract update(id: Id, data: UpdateData<T>): Promise<Record<T> | null>

}

//// Types ////

interface MongoDbSettings extends Infer<typeof $mongoDbSettings>{}

const $mongoDbSettings = $.shape({

    uri: $.string,
    database: $.string,

    port: $port.default(DEFAULT_MONGODB_PORT),

    user: $.string.optional,
    password: $.string.optional,

    logIcon: $logIcon.default(`🗄️`)

})

//// MongoDb ////

class MongoDbCollection<T extends object> extends Collection<T> {

    constructor(
        readonly _collection: any // < mongod types are absolutely fucked
    ) {
        super()
    }

    async get(id: Id): Promise<Record<T> | null> {
        const record = await this._collection.findOne(new ObjectId(id))

        return record && { 
            ...record,
            _id: record._id.toString()
        }
    }

    async find(query: FindQuery<T>): Promise<Paginated<T>> {

        const records: Record<T>[] = []

        const total = await this._collection.estimatedDocumentCount(query)

        if (total > 0) {
            const cursor = await this._collection.find(query)
            await cursor.forEach(({ _id, ...data }: Record<T>) => 
                records.push({
                    _id: _id.toString(),
                    ...data
                } as Record<T>)
            )
        }

        return {
            total,
            records
        }
    }

    async create(data: CreateData<T>): Promise<Record<T>> {

        const { insertedId: objectId } = await this._collection.insertOne(data)

        const id = objectId.toString()

        return this.get(id) as Promise<Record<T>>
    }

    async update(id: Id, data: UpdateData<T>): Promise<Record<T> | null> {

        await this._collection.updateOne({
            _id: new ObjectId(id)
        }, {
            $set: data
        })

        return this.get(id)
    }

    async remove(id: Id): Promise<Record<T> | null> {
        const record = await this.get(id)
        
        if (record) {
            await this._collection.deleteOne({
                _id: new ObjectId(id)
            })
        }

        return record
    }

}

class MongoDb extends Database<Required<MongoDbSettings>> {

    // Static Create with Schema Validation

    static create(settings: MongoDbSettings): MongoDb {
        return new MongoDb(
            $mongoDbSettings.validate(
                settings
            ) as Required<MongoDbSettings>
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

    getCollection<T extends object>(collection: string): MongoDbCollection<T> {

        // if (this.find(Client)) throw new Error(`Cannot access ${this.name} as a client.`)

        if (!this._db)
            throw new Error(`${this.name} is not connected.`)

        return new MongoDbCollection<T>(
            this._db.collection(collection)
        )
    }
    
}

//// Exports ////

export {
    MongoDb,
    MongoDbSettings,
    $mongoDbSettings,

    MongoDbCollection,

    Paginated,
    Record,
    Id,
    FindQuery,
    CreateData,
    UpdateData
}