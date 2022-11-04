
import { SettingsModule } from '../../module'

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
abstract class Database<S extends object = object> extends SettingsModule<S> {

    override _validateModules(): void {
        this._assertRoot()
        this._assertSingle()
    }

    abstract getCollection<T extends object>(collection: string): RecordCollection<T> 

}

abstract class RecordCollection<T extends object> {

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

export class DatabaseCollection<T extends object, S extends { collection: string }> 
    extends SettingsModule<S> 
    implements RecordCollection<T> {

    override _validateModules(): void {
        this._assertSingle()
    }

    get database(): Database<object> {
        return this.getModule(Database, true)   
    }

    get collection(): RecordCollection<T> {
        return this
            .database
            .getCollection(
                this.settings.collection
            )
    }
    
    get(id: Id): Promise<Record<T> | null> {
        return this.collection.get(id)
    }
        
    find(query: FindQuery<T>): Promise<Paginated<T>> {
        return this.collection.find(query)
    }

    create(data: CreateData<T>): Promise<Record<T>>{
        return this.collection.create(data)
    }

    remove(id: Id): Promise<Record<T> | null>{
        return this.collection.remove(id)
    }
 
    update(id: Id, data: UpdateData<T>): Promise<Record<T> | null> {
        return this.collection.update(id, data)
    }

}

//// Exports ////

export {

    Database,
    RecordCollection,

    Paginated,
    Record,
    Id,
    FindQuery,
    CreateData,
    UpdateData
}