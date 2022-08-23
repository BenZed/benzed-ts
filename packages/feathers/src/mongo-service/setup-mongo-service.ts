import { FeathersService, Service } from '@feathersjs/feathers'
import { MongoDBAdapterParams } from '@feathersjs/mongodb'

import MongoService, { MongoServiceOptions } from './mongo-service'
import { MongoApplication } from '../types'

/*** Main ***/

function setupMongoService<
    T,
    D = Partial<T>,
    P extends MongoDBAdapterParams = MongoDBAdapterParams
>(
    mongoApp: MongoApplication,
    options: MongoServiceOptions
): FeathersService<MongoApplication, Service<T, D, P>> {

    mongoApp.use(options.collection, new MongoService<T, D, P>(options))
    mongoApp.log`${options.collection} service configured`

    return mongoApp.service(options.collection)
}

/*** Exports ***/

export default setupMongoService

export {
    setupMongoService
}