import { 
    feathers, 
    FeathersInput, 
    FeathersOutput, 
} from '../builder'

import { 
    Koa, 
    Convenience,
    MongoDb 
} from '../components'

/*** Builder ***/

const mongoDbBuilder = feathers
    .add(Koa)
    .add(MongoDb)
    .add(Convenience)

/*** Types ***/

export type MongoDbBuilder = typeof mongoDbBuilder

export interface MongoDbAppConfig extends FeathersInput<MongoDbBuilder>{}

export interface MongoDbApp extends FeathersOutput<MongoDbBuilder> {}

/*** Main ***/

/**
 * Create a MongoDb Application
 */
export const createMongoDbApp = (config?: MongoDbAppConfig): MongoDbApp => mongoDbBuilder.build(config)

/*** Extend ***/

createMongoDbApp.builder = mongoDbBuilder