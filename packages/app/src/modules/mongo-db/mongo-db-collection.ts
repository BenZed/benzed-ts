import { SchemaFor } from '@benzed/schema'

import { ObjectId } from 'mongodb'

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

type Query<T extends object> = object 

//// Collection ////

class MongoDbCollection<T extends object> {

    constructor(
        readonly _schema: SchemaFor<T>
    ) { /**/ }

    /**
     * @internal
     * Connect this wrapper to an actual mongo db coollection
     */
    _connect(
        mongoCollection: any
    ): void {
        this._mongoCollection = mongoCollection
    }

    private _mongoCollection: any = undefined // mongo db types are fucked
    
    /**
     * Is this collection connected?
     */
    get connected(): boolean {
        return !!this._mongoCollection
    }

    /**
     * Get a record from the collection
     */
    async get(id: Id): Promise<Record<T> | null> {

        const record = await this
            ._mongoCollection
            .findOne(new ObjectId(id))

        return record && { 
            ...record,
            _id: id
        }
    }

    /**
     * Find records in the collection
     */
    async find(query: Query<T>): Promise<Paginated<T>> {

        const records: Record<T>[] = []
        const total = await this
            ._mongoCollection
            .estimatedDocumentCount(query)

        if (total > 0) {
            const cursor = await this._mongoCollection.find(query)
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
            ._mongoCollection
            .insertOne({ ...createData })

        return { 
            ...createData,
            _id: objectId.toString()
        }
    }

    /**
     * Update a record in the collection
     */
    async update(id: Id, data: Partial<T>): Promise<Record<T> | null> {

        const record = await this.get(id)
        if (!record)
            return null

        const { _id, ...existing } = record

        const updateData = this
            ._schema
            .validate({ ...existing, ...data })

        await this
            ._mongoCollection
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

//// Exports ////

export default MongoDbCollection

export {

    MongoDbCollection,

    Id,
    WithId,
    Record,
    Paginated,

    Query

}