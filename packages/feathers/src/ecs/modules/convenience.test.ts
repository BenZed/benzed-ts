import { feathers } from '../app-builder'

import { Convenience } from './convenience'

import { expectTypeOf } from 'expect-type'
import Koa from './koa'

/*** Tests ***/

it(`adds convenience config and methods`, () => {

    const expressApp = feathers
        .use(Koa)
        .use(Convenience)
        .build()

    expectTypeOf(expressApp.get(`name`)).toMatchTypeOf<string>()
    expectTypeOf(expressApp.get(`port`)).toMatchTypeOf<number>()

    expect(expressApp.env).toBeInstanceOf(Function)
    expect(expressApp.start).toBeInstanceOf(Function)
    expect(expressApp.isEnv).toBeInstanceOf(Function)
})

it(`cant be added twice`, () => {

    expect(
        () => feathers
            .use(Koa)
            .use(Convenience)
            .use(Convenience)
    ).toThrow(`cannot be used more than once`)

})