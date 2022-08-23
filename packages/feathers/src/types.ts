
import type { ObjectId } from './mongo-app/setup-mongo-db'

/*** Exports ***/

export type IdType = string | number | ObjectId

export interface Id<I extends IdType> {
    _id: I
}

export type {
    StringKeys
} from '@benzed/util'

export type {

    MongoDbConfig,
    ObjectId,
    Db,

} from './mongo-app/setup-mongo-db'

export type {

    MongoApplication,
    MongoApplicationConfig

} from './mongo-app/create-mongo-application'