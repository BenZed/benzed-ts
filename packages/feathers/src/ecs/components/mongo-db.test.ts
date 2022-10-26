import { feathers } from '../builder'

import Koa from './koa'
import { MongoDb, MongoDbConfig } from './mongo-db'

import { expectTypeOf } from 'expect-type'

/*** Tests ***/

it(`adds convenience config and methods`, () => {

    const expressApp = feathers
        .add(Koa)
        .add(MongoDb)
        .build()

    expectTypeOf(expressApp.get(`db`)).toMatchTypeOf<MongoDbConfig>()

    expect(expressApp.db).toBeInstanceOf(Function)
    expect(expressApp.client).toBe(null)
})

it(`cant be added twice`, () => {

    expect(
        () => feathers
            .add(Koa)
            .add(MongoDb)
            .add(MongoDb)
    ).toThrow(Error)

})