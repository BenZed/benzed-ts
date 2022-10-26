import { feathers } from '../builder'
import { MongoDBConfig } from '../../types'

import Koa from './koa'
import { MongoDb } from './mongodb'

import { expectTypeOf } from 'expect-type'

/*** Tests ***/

it(`adds convenience config and methods`, () => {

    const expressApp = feathers
        .add(new Koa())
        .add(new MongoDb())
        .build()

    expectTypeOf(expressApp.get(`db`)).toMatchTypeOf<MongoDBConfig>()

    expect(expressApp.db).toBeInstanceOf(Function)
    expect(expressApp.client).toBe(null)
})

it(`cant be added twice`, () => {

    expect(
        () => feathers
            .add(new Koa())
            .add(new MongoDb())
            .add(new MongoDb())
    ).toThrow(Error)

})