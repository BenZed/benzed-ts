import { feathers } from "../app-builder"
import Koa from './koa'
import { MongoDb, MongoDbConfig } from './mongo-db'

import { expectTypeOf } from 'expect-type'

/*** Tests ***/

it(`adds convenience config and methods`, () => {

    const expressApp = feathers
        .use(Koa)
        .use(MongoDb)
        .build()

    expectTypeOf(expressApp.get(`db`)).toMatchTypeOf<MongoDbConfig>()

    expect(expressApp.db).toBeInstanceOf(Function)
    expect(expressApp.client).toBe(null)
})

it(`cant be added twice`, () => {

    expect(
        () => feathers
            .use(Koa)
            .use(MongoDb)
            .use(MongoDb)
    ).toThrow(Error)

})