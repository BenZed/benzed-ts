import { FeathersService, Service } from '@feathersjs/feathers'
import { MongoDBService, MongoDBAdapterOptions, MongoDBAdapterParams } from '@feathersjs/mongodb'
import { MongoDBApplication } from './create-mongo-db-application'

declare module '@feathersjs/mongodb' {
    interface MongoDBService
    /**/ //eslint-disable-next-line @typescript-eslint/no-explicit-any        
    /**/ <T = any, D = Partial<T>, P extends MongoDBAdapterParams<any> = MongoDBAdapterParams> {

        update(id: null, data: D, params?: P): Promise<T[]>
        // TODO FIXME
        // I don't know how long this will be necessary for, but the current MongoDBService 
        // definition doesn't match that of other services, which causes type errors

    }
}

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
    P extends MongoDBAdapterParams = MongoDBAdapterParams
>(
    mongoApp: MongoDBApplication,
    options: MongoDBServiceOptions
): FeathersService<MongoDBApplication, Service<T, D, P>> {

    const {
        collection,
        path = collection,
        ...rest
    } = options

    const service = new MongoDBService<T, D, P>({
        ...rest,
        Model: mongoApp.db(collection)
    })

    mongoApp.use(path, service)
    mongoApp.log`${path} service configured`

    return mongoApp.service(path)
}

/*** Exports ***/

export default setupMongoDBService

export {
    setupMongoDBService,
    MongoDBServiceOptions,
    MongoDBService
}