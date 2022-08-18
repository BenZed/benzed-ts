import { FeathersService } from '@feathersjs/feathers'

import MongoService, { MongoServiceOptions } from './mongo-service'
import { MongoApplication, Service, Params } from '../types'

/*** Main ***/

function setupMongoService<T, D = Partial<T>, P = Params>(
    mongoApp: MongoApplication,
    collectionName: string,
    options?: Partial<MongoServiceOptions>
): FeathersService<MongoApplication, Service<T, D, P>> {

    const service = new MongoService<T, D>({
        collection: collectionName,
        ...options,
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mongoApp.use(collectionName as any, service as any)
    //                       ^ I don't know why this cast is necessary.

    mongoApp.log`${collectionName} service configured`

    return mongoApp.service(collectionName)
}

/*** Exports ***/

export default setupMongoService

export {
    setupMongoService
}