import { feathers } from './index'

import { through } from '@benzed/util'

import { FeathersModule } from './module'

import { expectTypeOf } from 'expect-type'
import { App } from '../types'

/*** TODO: These tests should really be in /ecs ***/

/*** Eslint ***/

/* eslint-disable 
    @typescript-eslint/no-explicit-any
*/

/*** Setup ***/

class TestBuild extends FeathersModule {

}

class TestRequire extends FeathersModule {

    protected override _validateComponents(): void {
        this._assertRequired(TestBuild)
    }
}

class TestSingle extends FeathersModule {

    protected override _validateComponents(): void {
        this._assertSingle()
    }
}

/*** Tests ***/

it(`creates feathers applications`, () => {
    
    const testApp = feathers.app
        .use(TestBuild)
        .build()

    expectTypeOf<typeof testApp>().toMatchTypeOf<App>()
})

it(`throws if no components have been added`, () => {

    expect(() => feathers.app.build())
        .toThrow(`Node must be created with at least one component`)

})

it(`use() must use build components`, () => {
 
    // @ts-expect-error not a feathers component
    expect(() => feathers.app.use({ compute: through }))
        .toThrow()

})

it(`use() must respect build component requirements`, () => {

    expect(() => feathers.app.use(TestRequire))
        .toThrow(`missing required components: ${TestBuild.name}`)

    expect(() => feathers.app
        .use(TestBuild)
        .use(TestRequire)).not.toThrow(Error)

})

it(`use() must respect single build components`, () => {

    expect(() => feathers.app
        .use(TestSingle)
        .use(TestSingle)
    ).toThrow(`${TestSingle.name} cannot be used more than once`)
})

it(`required components are provided when added`, () => {

    const f1 = feathers.app
        .use(TestBuild)
        .use(TestRequire)

    expect(f1.components[1].components).toEqual([f1.components[0]])
})