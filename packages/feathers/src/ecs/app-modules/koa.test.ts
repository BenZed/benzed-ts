import { feathers } from '../index'

import { ExtendsOf } from '../../types'

import { Koa, KoaExtends } from './koa'

import { expectTypeOf } from 'expect-type'
import { Server } from 'http'

/*** Tests ***/

it(`wraps app with koa methods`, () => {

    const koaApp = feathers.app
        .use(Koa)
        .build()

    type BuiltKoaApp = typeof koaApp
    type BuiltKoaExtends = ExtendsOf<BuiltKoaApp>
    expectTypeOf<BuiltKoaExtends>().toEqualTypeOf<KoaExtends>()

    expectTypeOf(koaApp.server).toMatchTypeOf<undefined | Server>()

    expect(koaApp.listen).toBeInstanceOf(Function)
    expect(typeof koaApp.proxy).toBe(`boolean`)
    expect(typeof koaApp.createContext).toBe(`function`)
})

it(`cant be added twice`, () => {

    expect(
        () => feathers.app
            .use(Koa)
            .use(Koa)
    ).toThrow(`cannot be used more than once`)

})