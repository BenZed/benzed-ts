import { feathers } from './builder'

import { through } from '@benzed/util'

import {FeathersComponent } from './component'

import { expectTypeOf } from 'expect-type'
import { App } from '../types'

/***  Eslint***/

/* eslint-disable 
    @typescript-eslint/no-explicit-any
*/

/*** Setup ***/

class TestBuild extends FeathersComponent {

}

class TestRequire extends FeathersComponent {

    protected _onValidateComponents(): void {
        this._assertRequired(TestBuild)
    }
}

class TestSingle extends FeathersComponent {

    protected _onValidateComponents(): void {
        this._assertSingle()
    }
}

/*** Tests ***/

it(`creates feathers applications`, () => {
    
    const app = feathers
        .add(new TestBuild())
        .build()

    expectTypeOf<typeof app>().toMatchTypeOf<App>()
})

it(`throws if no components have been added`, () => {

    expect(() => feathers.build())
        .toThrow(`Node must be created with at least one component`)

})

it(`add() must use build components`, () => {
 
    // @ts-expect-error not a feathers component
    expect(() => feathers.add({ compute: through }))
        .toThrow(`with ${FeathersComponent.name} instances`)

})

it(`add() must respect build component requirements`, () => {

    expect(() => feathers.add(new TestRequire()))
        .toThrow(`missing required components: ${TestBuild.name}`)

    expect(() => feathers
        .add(new TestBuild())
        .add(new TestRequire())).not.toThrow(Error)

})

it(`add() must respect single build components`, () => {

    expect(() => feathers
        .add(new TestSingle())
        .add(new TestSingle())
    ).toThrow(`${TestSingle.name} cannot be used more than once`)
})

it(`required components are provided when added`, () => {

    const require = new TestRequire()
    const build = new TestBuild()

    feathers
        .add(build)
        .add(require)

    expect(require.components).toEqual([build])
})