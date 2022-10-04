import { FeathersService, Service, ServiceOptions } from '@feathersjs/feathers'
import { MongoDBService, MongoDBAdapterOptions, MongoDBAdapterParams } from '@feathersjs/mongodb'

import { MongoDBApplication } from './create-mongo-db-application'

/* eslint-disable @typescript-eslint/no-explicit-any */
interface MongoDBServiceOptions extends Omit<MongoDBAdapterOptions, 'Model'> {

    /**
     * Name of the database collection to store documents
     */
    collection: string

    /**
     * Path the service should be registered, uses the collection name if not specified.
     */
    path?: string
}

/*** Main ***/

function setupMongoDBService<
    T,
    D = Partial<T>,
    P extends MongoDBAdapterParams<any> = MongoDBAdapterParams<any>
>(
    mongoApp: MongoDBApplication,
    mongoServiceOptions: MongoDBServiceOptions,
    feathersServiceOptions?: ServiceOptions
): FeathersService<MongoDBApplication, Service<T, D, P>> {

    const {
        collection,
        path = collection,
        ...rest
    } = mongoServiceOptions

    const service = new MongoDBService<T, D, P>({
        ...rest,
        Model: mongoApp.db(collection)
    })

    mongoApp.use(path, service as unknown as Service, feathersServiceOptions)
    mongoApp.log`${path} service configured`

    return mongoApp.service(path) as FeathersService<MongoDBApplication, Service<T, D, P>>
}

/*** Exports ***/

export default setupMongoDBService

export {
    setupMongoDBService,
    MongoDBServiceOptions,
    MongoDBService,

    MongoDBAdapterParams
}