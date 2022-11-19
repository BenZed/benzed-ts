
import { SettingsModule } from '../../module'

//// Eslint ////

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
*/

//// Base ////

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

/**
 * Just in case I intend to add support for more databases later,
 * they should all have the same interface
 */
abstract class Database<S extends object = object> extends SettingsModule<S> {

    override _validateModules(): void {
        this._assertSingle()
    }

    abstract getCollection<T extends object>(collection: string): RecordCollection<T> 

}

abstract class RecordCollection<T extends object> {

    /**
     * Returns a record if it exists, null otherwise.
     */
    abstract get(id: Id): Promise<Record<T> | null> 

    /**
     * 
     */
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

//// Exports ////

export {

    Database,
    RecordCollection,

    Paginated,
    Record,

    Id,
    WithId,

    FindQuery,
    CreateData,
    UpdateData
}