import { 
    FeathersInput, 
    FeathersOutput, 
} from '../app-builder'

import {
    feathers
} from '../index'

import { 
    Koa, 
    Convenience,
    MongoDb 
} from '../app-modules'

/*** Builder ***/

const mongoDbBuilder = feathers
    .app
    .use(Koa)
    .use(MongoDb)
    .use(Convenience)

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