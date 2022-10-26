import { ExtendsOf } from '../../types'
import { feathers } from '../builder'

import { Koa, KoaExtends } from './koa'

import { expectTypeOf } from 'expect-type'
import { Server } from 'http'

/*** Tests ***/

it(`wraps app with koa methods`, () => {

    const koaApp = feathers
        .add(new Koa())
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
        () => feathers
            .add(new Koa())
            .add(new Koa())
    ).toThrow(`cannot be used more than once`)

})