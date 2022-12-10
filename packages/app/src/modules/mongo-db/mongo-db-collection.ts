import { Schematic } from '@benzed/schema'
import { nil } from '@benzed/util'

import { Collection as _MongoCollection, ObjectId } from 'mongodb'
import { SchemaHook, toSchematic } from '../../util'

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

type RecordOf<C extends MongoDbCollection<any>> = C extends MongoDbCollection<infer R> ? R : object

//// Collection ////

class MongoDbCollection<T extends object> {

    readonly _schema: Schematic<T>
    constructor(
        schematic: SchemaHook<T>
    ) { 
        this._schema = toSchematic(schematic)
    }

    /**
     * @internal
     * Connect this wrapper to an actual mongo db coollection
     */
    _connect(
        mongoCollection: _MongoCollection
    ): void {
        this._mongoCollection = mongoCollection
    }

    /**
     * @internal
     */
    get _collection(): _MongoCollection {
        if (!this._mongoCollection)
            throw new Error('Not yet connected')
        return this._mongoCollection
    }
    private _mongoCollection: _MongoCollection | nil = nil
    
    /**
     * Is this collection connected?
     */
    get connected(): boolean {
        return !!this._mongoCollection
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
    async find(query: RecordQuery<T>): Promise<Paginated<Record<T>>> {

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

    /**
     * Create a record in the collection
     */
    async create(data: T): Promise<Record<T>> {

        const createData = this._schema.validate(data)

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
            ._schema
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