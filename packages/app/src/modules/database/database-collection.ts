import is from '@benzed/is'

import { 
    SettingsModule 
} from '../../module'
import { Service } from '../../service'

import { 
    Database,

    CreateData,
    UpdateData,
    FindQuery, 

    Id, 
    Paginated, 

    Record, 
    RecordCollection, 

} from './database'

/* eslint-disable 
    @typescript-eslint/unified-signatures
*/

//// CONSTANTS ////

const DEFAULT_COLLECTION_NAME = 'records'

//// Base ////

class DatabaseCollection<T extends object = object> 
    extends SettingsModule<{ collection?: string }> 
    implements RecordCollection<T> {

    //// Sealed ////
    static create<Tx extends object>(): DatabaseCollection<Tx> 
    static create<Tx extends object>(
        collection: string
    ): DatabaseCollection<Tx> 
    static create<Tx extends object>(
        settings: { collection: string }
    ): DatabaseCollection<Tx> 
    
    static create<Tx extends object>(
        settingOrCollection?: string | { collection: string }
    ) : DatabaseCollection<Tx> {
        const settings = is.string(settingOrCollection) 
            ? { collection: settingOrCollection } 
            : settingOrCollection ?? { }
        return new DatabaseCollection<Tx>(settings)
    }

    private constructor(
        settings: { collection?: string }
    ) {
        super(settings)
    }

    //// Validation ////

    override _validateModules(): void {
        this._assertSingle()
    }

    override async start(): Promise<void> {
        await super.start()
        this._assertRequired(Database, 'parents')
    }
    
    //// Interface ////

    get database(): Database<object> {
        return this.getModule(Database, true, 'parents')   
    }

    get _collectionName(): string {
        let name = this.settings.collection
        if (name)
            return name

        if (this.parent instanceof Service)
            name = this.parent.path.replaceAll('/', '')

        return DEFAULT_COLLECTION_NAME
    }

    get collection(): RecordCollection<T> {

        return this
            .database
            .getCollection(
                this._collectionName
            )
    }

    //// RecordCollection Implementation ////
    
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

export default DatabaseCollection 

export {
    DatabaseCollection
}