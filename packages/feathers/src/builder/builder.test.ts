import { builder } from './builder'

import { Application } from '@feathersjs/feathers'

import { expectTypeOf } from 'expect-type'
import BuildComponent from './build-component'
import { Empty } from '@benzed/util/lib'

/*** Setup ***/

class TestBuildComponent extends BuildComponent<Empty, [], false> {

    single = false as const

    required = []

    protected _createBuildEffect(required: []): Empty {
        return {}
    }

}

/*** Tests ***/

it(`creates feathers applications`, () => {
    
    const app = builder
        .add(new TestBuildComponent())
        .build()

    expectTypeOf<typeof app>().toMatchTypeOf<Application>()
})

it(`throws if no components have been added`, () => {

    expect(() => builder.build())

})

it.todo(`add() must use build components`)

it.todo(`add() must respect build component requirements`)

it.todo(`add() must respect single build components`)