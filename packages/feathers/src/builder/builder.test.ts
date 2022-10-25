import { builder } from './builder'

import { Application } from '@feathersjs/feathers'

import { expectTypeOf } from 'expect-type'

/*** Setup ***/

/*** Tests ***/

it.skip(`creates feathers applications`, () => {
    
    const app = builder.build()

    expectTypeOf<typeof app>().toMatchTypeOf<Application>()
})

it.todo(`add() must use build components`)

it.todo(`add() must respect build component requirements`)

it.todo(`add() must respect single build components`)