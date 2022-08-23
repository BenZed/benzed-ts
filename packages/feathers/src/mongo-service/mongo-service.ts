import { until } from '@benzed/async/lib'
import {
    MongoDBService,
    MongoDBAdapterOptions,
    MongoDBAdapterParams
} from '@feathersjs/mongodb'
import { Collection, Document } from 'mongodb'

import { Db, MongoApplication } from '../mongo-app'

/*** Types ***/

interface MongoServiceOptions extends Omit<MongoDBAdapterOptions, 'Model'> {
    collection: string
}

// TODO '@feathersjs/mongodb' update typing is bugged
declare module '@feathersjs/mongodb' {
    interface MongoDBService
    /**/ //eslint-disable-next-line @typescript-eslint/no-explicit-any        
    /**/ <T = any, D = Partial<T>, P extends MongoDBAdapterParams<any> = MongoDBAdapterParams> {

        update(id: null, data: D, params?: P): Promise<T[]>

    }
}

/*** Main ***/

class MongoService<T, D = Partial<T>, P extends MongoDBAdapterParams = MongoDBAdapterParams>
    extends MongoDBService<T, D, P> {

    private _collectionName: string
    public get collectionName(): string {
        return this._collectionName
    }

    public constructor (options: MongoServiceOptions) {

        const { collection, ...rest } = options

        super({
            ...rest,
            Model: until(() => this.options.Model instanceof Collection)
                .then(() => this.options.Model)
        })

        this._collectionName = collection
    }

    public setup(app: MongoApplication): Promise<void> {
        this.updateModel(app.db())
        return Promise.resolve()
    }

    // public async teardown(): Promise<void> { /**/ }

    public updateModel(db: Db, collectionName = this._collectionName): void {
        this._collectionName = collectionName
        this.options.Model = db.collection(collectionName)
    }
}

/*** Exports ***/

export default MongoService

export {
    MongoService,
    MongoServiceOptions
}