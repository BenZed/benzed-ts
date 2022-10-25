import { feathers } from '../builder'

import { Express } from './express'

import { expectTypeOf } from 'expect-type'
import { Server } from 'http'

/*** Tests ***/

it(`wraps app with express methods`, () => {

    const expressApp = feathers
        .add(new Express())
        .build()

    expectTypeOf(expressApp.server).toMatchTypeOf<undefined | Server>()

    expect(expressApp.listen).toBeInstanceOf(Function)
    expect(typeof expressApp.engine).toBe(`function`)
    expect(typeof expressApp.render).toBe(`function`)
})

it(`cant be added twice`, () => {

    expect(
        () => feathers
            .add(new Express())
            // @ts-expect-error Can't be added twice
            .add(new Express())
    ).toThrow(Error)

})