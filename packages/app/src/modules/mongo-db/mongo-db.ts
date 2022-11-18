import { StringKeys } from '@benzed/util'
import { $, Infer, SchemaFor } from '@benzed/schema'

import { SettingsModule } from '../../module'
import { $logIcon, $port } from '../../schemas'
import { DEFAULT_MONGODB_PORT } from '../../constants'

import { 
    MongoClient as _MongoClient, 
    Db as _MongoDatabase, 
    ObjectId,
} from 'mongodb'

//// Eslint ////

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
    @typescript-eslint/ban-types
*/

//// Types ////

type Id = string

type WithId = { _id: Id }

type Record<T extends object> = T & WithId

type Paginated<T extends object> = {
    total: number
    records: Record<T>[]
    // skip: number
    // limit: number
}

type CreateData<T extends object> = T
type UpdateData<T extends object> = Partial<T>
type FindQuery<T extends object> = object 

////  ////

interface MongoDbSettings extends Infer<typeof $mongoDbSettings>{}

const $mongoDbSettings = $.shape({

    uri: $
        .string
        .optional
        .default('mongodb://127.0.0.1:<port>/<database>'),

    database: $.string,

    port: $port
        .optional
        .default(DEFAULT_MONGODB_PORT),

    user: $
        .string
        .optional,

    password: $
        .string
        .optional,

    logIcon: $logIcon.default('🗄️')

})

//// Collection ////

class Collection<T extends object> {

    constructor(
        readonly _schema: SchemaFor<T>
    ) { /**/ }

    private _mongoCollection: any = undefined // mongo db types are fucked
    connect(
        mongoCollection: any
    ): void {
        this._mongoCollection = mongoCollection
    }

    get connected(): boolean {
        return !!this._mongoCollection
    }

    async get(id: Id): Promise<Record<T> | null> {

        const record = await this
            ._mongoCollection
            .findOne(new ObjectId(id))

        return record && { 
            ...record,
            _id: record._id.toString()
        }
    }

    async find(query: FindQuery<T>): Promise<Paginated<T>> {

        const records: Record<T>[] = []
        const total = await this
            ._mongoCollection
            .estimatedDocumentCount(query)

        if (total > 0) {
            const cursor = await this._mongoCollection.find(query)
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

        const { insertedId: objectId } = await this._mongoCollection.insertOne(data)
        const id = objectId.toString()

        return this.get(id) as Promise<Record<T>>
    }

    async update(id: Id, data: UpdateData<T>): Promise<Record<T> | null> {

        await this._mongoCollection.updateOne({
            _id: new ObjectId(id)
        }, {
            $set: data
        })
        return this.get(id)
    }

    async remove(id: Id): Promise<Record<T> | null> {

        const record = await this.get(id)
        if (record) {
            await this._mongoCollection.deleteOne({
                _id: new ObjectId(id)
            })
        }

        return record
    }
}

//// Collections ////

type Collections = {
    [key: string]: Collection<object>
}

type _AddCollection<C extends Collections, N extends string, Cx extends Collection<any>> = {
    [K in StringKeys<C> | N]: K extends N ? Cx : C[K]
}

type AddCollection<C extends Collections, N extends string, Cx extends Collection<any>> = 
    _AddCollection<C,N,Cx> extends Collections ? _AddCollection<C,N,Cx> : never

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

    // Database Implementation

    addCollection<N extends string, T extends object>(
        name: N, 
        schema: SchemaFor<T>
    ): MongoDb<AddCollection<C, N, Collection<T>>> {

        const collections = {
            ...this._collections,
            [name as N]: new Collection<T>(schema)
        } as unknown as AddCollection<C, N, Collection<T>>

        return new MongoDb(
            this.settings,
            collections
        )
    }

    getCollection<N extends StringKeys<C>>(name: N): C[N] {

        if (!this._db)
            throw new Error(`${this.name} is not connected.`)

        const collection = this._collections[name]
        if (!collection.connected)
            collection.connect(this._db.collection(name))

        return collection
    }
}

//// Exports ////

export {

    MongoDb,

    MongoDbSettings,
    $mongoDbSettings

}