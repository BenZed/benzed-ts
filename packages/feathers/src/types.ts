
import type { ObjectId } from './mongo-db-app/setup-mongo-db'

/*** Exports ***/

export type IdType = string | number | ObjectId

export interface Id<I extends IdType> {
    _id: I
}

export type {
    StringKeys
} from '@benzed/util'

export type {

    MongoDBConfig,
    ObjectId,
    Db,

} from './mongo-db-app/setup-mongo-db'

export type {

    MongoDBApplication,
    MongoDBApplicationConfig

} from './mongo-db-app/create-mongo-db-application'