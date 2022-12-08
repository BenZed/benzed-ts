import { memoize } from '@benzed/util'
import { provider, Provider } from '../../command'

import { MongoDb } from '../mongo-db'
import MongoDbCollection from '../mongo-db-collection'

//// Main ////

const provideRecords = memoize(
    <I extends object, R extends object>(
        collection: string
    ): Provider<I, MongoDbCollection<R>> => 
        provider(cmd => cmd
            .getModule(MongoDb, true, 'parents')
            .getCollection(collection)
        )
)

//// Exports ////

export default provideRecords

export {
    provideRecords
}