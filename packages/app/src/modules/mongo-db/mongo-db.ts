import { StringKeys } from '@benzed/util'
import $, { Infer, SchemaFor } from '@benzed/schema'

import { 
    MongoClient as _MongoClient, 
    Db as _MongoDatabase, 
} from 'mongodb'

import { 
    SettingsModule 
} from '../../module'

import { Command, RuntimeCommand } from '../../command'

import { 
    $mongoDbSettings,
    MongoDbSettings 
} from './mongo-db-settings'

import MongoDbCollection, { Paginated, Record, RecordOf } from './mongo-db-collection'

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

//// Record Commands ////

type RecordCommands<T extends object> = [
    Command<'get', { id: string }, Promise<Record<T>>>,
    Command<'find', Infer<typeof $query>, Promise<Paginated<Record<T>>>>,
    Command<'create', T, Promise<Record<T>>>,
    Command<'update', { id: string, data: Partial<object> }, Promise<Record<T>>>,
    Command<'remove', { id: string }, Promise<Record<T>>>
]

// TODO temp: figure me out
const $id = $({ id: $.string })
const $query = $.object
const $update = $.object as unknown as SchemaFor<{ id: string, data: Partial<object> }>

//// Hooks ////

const provideRecords = <I extends object>(collectionName: string) => 
    function (this: RuntimeCommand<I>, input: I) {
        const records = this
            .getModule(MongoDb, true, 'parents')
            .getCollection(collectionName) as MongoDbCollection<object>

        return { ...input, records }
    }

//// Mongodb Database ////

class MongoDb<C extends Collections> extends SettingsModule<Required<MongoDbSettings>> {

    // Static Create with Schema Validation

    static createRecordCommands<T extends object>(name: string, schema: SchemaFor<T>): RecordCommands<T>

    static createRecordCommands<T extends object>(name: string, collection: MongoDbCollection<T>): RecordCommands<T> 
    
    static createRecordCommands(collectionName: string, collection: MongoDbCollection<object> | SchemaFor<object>): RecordCommands<object> {

        // Setup

        const $create = '_schema' in collection ? collection._schema : collection

        const assertRecord = (id: string) => (record: Record<object> | null): Record<object> => {
            if (!record)
                throw new Error(`Collection ${collectionName} record ${id} could not be found.`)
            return record
        }

        // Commmands 

        return [

            Command.get($id)
                .useHook(provideRecords(collectionName))
                .useHook(({ records, id }) => records.get(id).then(assertRecord(id))),
                
            Command.find($query)
                .useHook(provideRecords(collectionName))
                .useHook(({ records, ...query }) => records.find(query)),
            
            Command.create($create)
                .useHook(provideRecords(collectionName))
                .useHook(({ records, ...data }) => records.create(data)),

            Command.update($update)
                .useHook(provideRecords(collectionName))
                .useHook(({ records, id, ...data }) => records.update(id, data).then(assertRecord(id))),

            Command.remove($id)
                .useHook(provideRecords(collectionName))
                .useHook(({ records, id }) => records.remove(id).then(assertRecord(id)))

        ]
    }

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

    protected override get _copyParams(): unknown[] {
        return [
            this.settings,
            this._collections
        ]
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

    getCollection<N extends StringKeys<C>>(name: N): C[N]
    getCollection<T extends object>(name: string): MongoDbCollection<T> {

        const collection = this._getCollection(name as StringKeys<C>)

        if (!this._db)
            throw new Error(`${this.name} is not connected.`)

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

    createRecordCommands<N extends StringKeys<C>>(collectionName: N): RecordCommands<RecordOf<C[N]>> 
    createRecordCommands<T extends object>(collectionName: string): RecordCommands<T> {
        const collection = this._getCollection(collectionName as StringKeys<C>)
        return MongoDb.createRecordCommands(collectionName, collection)
    }

    private _getCollection<N extends StringKeys<C>>(name: N): C[N]
    private _getCollection<T extends object>(name: string): MongoDbCollection<T> {
        const collection = this._collections[name]
        if (!collection)
            throw new Error(`Collection '${name}' does not exist.`)

        return collection
    }

}

//// Exports ////

export {

    MongoDb,

    MongoDbSettings,
    $mongoDbSettings

}