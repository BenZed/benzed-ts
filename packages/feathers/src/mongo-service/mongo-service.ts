import {
    Service,
    ServiceOptions
} from 'feathers-mongodb'

import { Db, MongoApplication } from '../mongo-app'
import { Params } from '../types'

/*** Types ***/

interface MongoServiceOptions extends ServiceOptions {
    collection: string
}

/*** Main ***/

class MongoService<T, D = Partial<T>>
    extends Service<T, D> {

    private _collectionName: string
    public get collectionName(): string {
        return this._collectionName
    }

    public constructor (options: MongoServiceOptions) {

        const { collection, ...rest } = options

        super(rest)

        this._collectionName = collection
    }

    // @ts-expect-error This signature is actually correct.
    public setup(app: MongoApplication): Promise<void> {
        this.updateModel(app.db())
    }

    // public async teardown(): Promise<void> { /**/ }

    public updateModel(db: Db, collectionName = this._collectionName): void {
        this._collectionName = collectionName
        this.Model = db.collection(collectionName)
    }
}

/*** Exports ***/

export default MongoService

export {
    MongoService,
    MongoServiceOptions
}