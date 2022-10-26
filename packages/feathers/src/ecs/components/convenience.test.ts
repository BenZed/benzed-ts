import { feathers } from '../builder'

import { Convenience } from './convenience'

import { expectTypeOf } from 'expect-type'
import Koa from './koa'

/*** Tests ***/

it(`adds convenience config and methods`, () => {

    const expressApp = feathers
        .add(new Koa())
        .add(new Convenience())
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
            .add(new Koa())
            .add(new Convenience())
        // @ts-expect-error Can't be added twice
            .add(new Convenience())
    ).toThrow(Error)

})