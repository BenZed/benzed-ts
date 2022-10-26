import { 
    feathers, 
    FeathersInput, 
    FeathersOutput, 

    Koa, 
    Convenience,
    MongoDb 

} from '../ecs'

/*** Build ***/

/**
 * FeathersBuilder with MongoDBApp Components
 */
const mongodb = feathers
    .add(Koa)
    .add(MongoDb)
    .add(Convenience)

type MongoDbBuilder = typeof mongodb

interface MongoDbConfig extends FeathersInput<MongoDbBuilder>{ }

interface MongoDbApp extends FeathersOutput<MongoDbBuilder> {}

/*** Main ***/

export function createMongoDbApp(c: MongoDbConfig): MongoDbApp {
    return mongodb.build(c)
}

createMongoDbApp.extend = mongodb