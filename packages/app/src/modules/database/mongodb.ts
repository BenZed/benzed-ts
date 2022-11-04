import { $, Infer } from '@benzed/schema'

import { $logIcon, $port } from '../../schemas'
import { DEFAULT_MONGODB_PORT } from '../../constants'
import { 
    Record, 
    RecordCollection, 

    CreateData, 
    Database, 
    FindQuery, 
    UpdateData,
    
    Id, 
    Paginated, 
} from './database'

import { 
    MongoClient as _MongoClient, 
    Db as _MongoDatabase, 
    ObjectId,
} from 'mongodb'

//// Eslint ////

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
*/

//// Types ////

interface MongoDbSettings extends Infer<typeof $mongoDbSettings>{}

const $mongoDbSettings = $.shape({

    uri: $.string
        .optional
        .default('mongodb://127.0.0.1:<port>/<database>'),
    database: $.string,

    port: $port
        .optional
        .default(DEFAULT_MONGODB_PORT),

    user: $.string.optional,
    password: $.string.optional,

    logIcon: $logIcon.default('🗄️')

})

//// MongoDbCollection ////

class MongoDbCollection<T extends object> extends RecordCollection<T> {

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

//// Mongodb Database ////

class MongoDb extends Database<Required<MongoDbSettings>> {

    // Static Create with Schema Validation

    static create(settings: MongoDbSettings): MongoDb {
        return new MongoDb(
            $mongoDbSettings.validate(
                settings
            ) as Required<MongoDbSettings>
        )
    }

    private constructor(
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

    // Database Implementation

    getCollection<T extends object>(collection: string): MongoDbCollection<T> {

        // if (this.find(Client)) throw new Error(`Cannot access ${this.name} as a client.`)

        if (!collection)
            throw new Error('Collection name cannot be empty.')

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

}