import { $, Schematic } from '@benzed/schema'
import { Node } from '@benzed/ecs'
import { nil } from '@benzed/util'

import { AppModule } from '../../app-module'

import { Collection as _MongoCollection, ObjectId } from 'mongodb'
import { SchemaHook, toSchematic, HttpMethod, HttpCode } from '../../util'
import { MongoDb } from './mongo-db'
import { Command, CommandError } from '../command'

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

type IdInput = { readonly id: Id }

type MongoDbCollectionCommands<T extends object> = {

    get: Node<[Command<HttpMethod.Get, IdInput, Promise<Record<T>>>], {}>

    find: Node<[Command<HttpMethod.Get, RecordQuery<T>, Promise<Paginated<T>>>], {}>

    create: Node<[Command<HttpMethod.Post, T, Promise<Record<T>>>], {}>

    update: Node<[Command<HttpMethod.Patch, IdInput & Partial<T>, Promise<Record<T>>>], {}>

    remove: Node<[Command<HttpMethod.Delete, IdInput, Promise<Record<T>>>], {}>

}

//// Collection ////

class MongoDbCollection<N extends string, T extends object> extends AppModule<{ name: N, schema: Schematic<T> }> {

    static create<Nx extends string, Tx extends object>(name: Nx, schema: SchemaHook<Tx>): MongoDbCollection<Nx,Tx> {
        return new MongoDbCollection(name, schema)
    }

    constructor(name: N, schema: SchemaHook<T>) {
        super({
            name, 
            schema: toSchematic(schema)
        })
    }

    get db(): MongoDb {
        return this.node.assertModule.inAncestors(MongoDb)
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

        if (!ObjectId.isValid(id))
            throw new Error(`${id} is not a valid object-id.`)

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
    async find(query: RecordQuery<T>): Promise<Paginated<T>> {

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

    //// Builder ////
    
    override get name(): N {
        return this.data.name
    }

    getName(): N {
        return this.name
    }

    setName<Nx extends string>(name: Nx): MongoDbCollection<Nx, T> {
        this._assertStopped()
        return new MongoDbCollection(name, this.schema)
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

    createCommands(): MongoDbCollectionCommands<T> {

        // We don't actually need to compose schematics because the collection methods + mongodb validate the input anyway
        const $id = $.unknown as Schematic<IdInput>
        const $query = $.unknown as Schematic<RecordQuery<T>>
        const $update = $.unknown as Schematic<IdInput & Partial<T>>
        const $create = this.schema

        //// Stuff ////

        const assertRecord = (id: Id) => (input: Record<T> | nil): Record<T> => {
            if (!input)
                throw new CommandError(HttpCode.NotFound, `No ${this.name} record for id ${id} could be found`)
            return input
        } 

        const get = Node.create(
            Command.get($id, ({ id }) => this.get(id).then(assertRecord(id)))
        )

        const find = Node.create(
            Command.get($query, query => this.find(query))
        )

        const create = Node.create(
            Command.post($create, data => this.create(data))
        )

        const update = Node.create(
            Command.patch($update, ({ id }) => this.get(id).then(assertRecord(id)))
        )

        const remove = Node.create(
            Command.delete($id, ({ id }) => this.remove(id).then(assertRecord(id)))
        )

        return {
            get,
            find,
            create,
            update,
            remove,
        }
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