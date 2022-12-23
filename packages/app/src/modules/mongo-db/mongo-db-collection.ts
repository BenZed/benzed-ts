import { Schematic } from '@benzed/schema'
import { nil } from '@benzed/util'

import { AppModule } from '../../app-module'

import { Collection as _MongoCollection, ObjectId } from 'mongodb'
import { SchemaHook, toSchematic } from '../../util'
import { MongoDb } from './mongo-db'

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

type RecordQuery<T extends object> = {
    [K in keyof T]?: T[K]
}

type RecordOf<C extends MongoDbCollection<string, object>> = C extends MongoDbCollection<string, infer R> ? R : object

//// Collection ////

class MongoDbCollection<N extends string, T extends object> extends AppModule<{ name: N, schema: Schematic<T>}> {

    override get name(): N {
        return this.data.name
    }

    getName(): N {
        return this.name
    }

    setName<Nx extends string>(name: Nx): MongoDbCollection<Nx, T> {
        this._assertStopped()
        return new MongoDbCollection(name, this.data.schema)
    }

    constructor(name: N, schema: SchemaHook<T>) {
        super({
            name, 
            schema: toSchematic(schema)
        })
    }

    get db(): MongoDb {
        return this.assert().inAncestors(MongoDb)
    }

    isConnected(): boolean {
        return this.db.isConnected
    }

    /**
     * @internal
     */
    get _collection(): _MongoCollection {
        return this.db._database.collection(this.data.name)
    }

    /**
     * Get a record from the collection
     */
    async get(id: Id): Promise<Record<T> | nil> {

        const record = await this
            ._collection
            .findOne(new ObjectId(id)) ?? nil

        return record && { 
            ...record,
            _id: id
        } as Record<T>
    }

    /**
     * Find records in the collection
     */
    async query(query: RecordQuery<T>): Promise<Paginated<Record<T>>> {

        const records: Record<T>[] = []
        const total = await this
            ._collection
            .estimatedDocumentCount(query)

        if (total > 0) {
            const cursor = await (this._collection as any).find(query)
            await cursor.forEach(({ _id, ...data }: Record<T>) => 
                records.push({
                    ...data,
                    _id: _id.toString(),
                } as Record<T>)
            )
        }

        return {
            total,
            records
        }
    }

    get schema(): Schematic<T> {
        return this.data.schema
    }

    getSchema(): Schematic<T> {
        return this.schema
    }

    setSchema<Tx extends object>(schema: SchemaHook<Tx>): MongoDbCollection<N, Tx> {
        this._assertStopped()
        return new MongoDbCollection(this.name, toSchematic(schema))
    }

    /**
     * Create a record in the collection
     */
    async create(data: T): Promise<Record<T>> {

        const createData = this.schema.validate(data)

        const { insertedId: objectId } = await this
            ._collection
            .insertOne({ ...createData })

        return { 
            ...createData,
            _id: objectId.toString()
        }
    }

    /**
     * Update a record in the collection
     */
    async update(id: Id, data: Partial<T>): Promise<Record<T> | nil> {

        const record = await this.get(id)
        if (!record)
            return nil

        const { _id, ...existing } = record

        const updateData = this
            .schema
            .validate({ ...existing, ...data })

        await this
            ._collection
            .updateOne({
                _id: new ObjectId(id)
            }, {
                $set: updateData
            })

        return { ...updateData, _id }
    }

    /**
     * Remove a record from the collection
     */
    async remove(id: Id): Promise<Record<T> | nil> {
        const record = await this.get(id)
        if (record) {
            await this._collection.deleteOne({
                _id: new ObjectId(id)
            })
        }
        return record
    }

    /**
     * Clear all records in a collection
     */
    async clear(): Promise<void> {
        await this._collection.deleteMany({})
    }

}

//// Exports ////

export default MongoDbCollection

export {

    MongoDbCollection,

    Id,
    WithId,
    Record,
    RecordOf,
    Paginated,

    RecordQuery

}