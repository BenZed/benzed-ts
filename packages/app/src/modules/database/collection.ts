import $, { Schema, SchemaFor } from '@benzed/schema'

import { Database, Record, RecordCollection } from './database'

import { SettingsModule } from '../../module'

//// Settings ////

interface CollectionSettings<T extends object> {

    /**
     * Name of the collection to store data in.
     */
    name: string

    /**
     * Schema to use when valiating data being created or updated 
     * in the collection. 
     */
    schema: SchemaFor<T> //| { create: SchemaFor<T>, update: SchemaFor<Partial<T>> }

}

const $collectionName = $.string
    .lowerCase()
    .length('>', 0)
    .format('alphanumeric')
    .name('collection')

const $schema = $.unknown.asserts(i => i instanceof Schema)

//// Main ////

class Collection<R extends object> 
    extends SettingsModule<CollectionSettings<R>> 
    implements RecordCollection<R> {

    get database(): Database {
        return this.getModule(Database, true, 'parents')
    }

    get records(): RecordCollection<R> {
        return this.database.getCollection(this.settings.name)
    }

    // static create with schema validation

    static create<Rx extends object>(settings: CollectionSettings<Rx>): Collection<Rx> {
        return new Collection({

            name: $collectionName
                .validate(settings.name),
            
            schema: $schema
                .validate(settings.schema) as SchemaFor<Rx>
        })
    }
    
    private constructor(
        settings: CollectionSettings<R>
    ) {
        super(settings)
    }

    async create(data: R): Promise<Record<R>> {
       
        const { schema: $create } = this.settings
        
        const record = await this
            .records
            .create(
                $create.validate(data)
            )

        return record
    }

}

//// Exports ////

export default Collection

export {
    Collection
}