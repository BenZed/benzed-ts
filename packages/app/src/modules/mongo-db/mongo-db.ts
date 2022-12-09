import { KeysOf, nil } from '@benzed/util'
import { SchemaFor } from '@benzed/schema'

import { 
    MongoClient as _MongoClient, 
    Db as _MongoDatabase,
} from 'mongodb'

import { 
    SettingsModule 
} from '../../module'

import { Command, RuntimeCommand } from '../command'

import { 
    $mongoDbSettings,
    MongoDbSettings 
} from './mongo-db-settings'

import MongoDbCollection, { Paginated, RecordQuery, Record, RecordOf } from './mongo-db-collection'

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

//// Record Commands ////

type RecordCommands<T extends object> = [
    Command<'get', { id: string }, Record<T>>,
    Command<'find', RecordQuery<T>, Paginated<Record<T>>>,
    Command<'create', T, Record<T>>,
    Command<'update', { id: string } & Partial<T>, Record<T>>,
    Command<'remove', { id: string }, Record<T>>
]

//// Mongodb Database ////

class MongoDb<C extends Collections> extends SettingsModule<Required<MongoDbSettings>> {

    // Static Create with Schema Validation

    static createRecordCommands<T extends object>(collectionName: string): RecordCommands<T>
    static createRecordCommands(collectionName: string): RecordCommands<object> {

        const assertRecord = (id: string) => (record: Record<object> | null): Record<object> => {
            if (!record)
                throw new Error(`Collection ${collectionName} record ${id} could not be found.`)
            return record
        }

        const records = <I extends object>(cmd: RuntimeCommand<I>): MongoDbCollection<object> => cmd
            .getModule(MongoDb, true, 'parents')
            .getCollection(collectionName)

        // Commmands 

        return [
            Command.get(({ id }, cmd) => records(cmd).get(id).then(assertRecord(id))),
                
            Command.find((query, cmd) => records(cmd).find(query)),
            
            Command.create((data, cmd) => records(cmd).create(data)),

            Command.update(({ id, ...data }, cmd) => records(cmd).update(id, data).then(assertRecord(id))),

            Command.remove(({ id }, cmd) => records(cmd).remove(id).then(assertRecord(id)))
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

    private _mongoClient: _MongoClient | nil = nil
    private _db: _MongoDatabase | nil = nil

    override async start(): Promise<void> {

        await super.start()
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
        
        await super.stop()
        if (!this._mongoClient) 
            return 

        await this._mongoClient.close()

        this._mongoClient = nil
        this._db = nil

        this.log`mongodb disconnected`
    }

    override _validateModules(): void {
        this._assertSingle()
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

    createRecordCommands<N extends KeysOf<C>>(collectionName: N): RecordCommands<RecordOf<C[N]>> 
    createRecordCommands<T extends object>(collectionName: string): RecordCommands<T> {
        return MongoDb.createRecordCommands<T>(collectionName)
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