import { feathers } from '../index'

import { Express } from './express'

import { expectTypeOf } from 'expect-type'
import { Server } from 'http'

/*** Tests ***/

it(`wraps app with express methods`, () => {

    const expressApp = feathers.app
        .use(Express)
        .build()

    expectTypeOf(expressApp.server).toMatchTypeOf<undefined | Server>()

    expect(expressApp.listen).toBeInstanceOf(Function)
    expect(typeof expressApp.engine).toBe(`function`)
    expect(typeof expressApp.render).toBe(`function`)
})

it(`cant be added twice`, () => {

    expect(
        () => feathers.app
            .use(Express)
            .use(Express)
    ).toThrow(`cannot be used more than once`)

})