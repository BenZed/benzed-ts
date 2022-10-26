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
        .add(TestBuild)
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
        .toThrow()

})

it(`add() must respect build component requirements`, () => {

    expect(() => feathers.add(TestRequire))
        .toThrow(`missing required components: ${TestBuild.name}`)

    expect(() => feathers
        .add(TestBuild)
        .add(TestRequire)).not.toThrow(Error)

})

it(`add() must respect single build components`, () => {

    expect(() => feathers
        .add(TestSingle)
        .add(TestSingle)
    ).toThrow(`${TestSingle.name} cannot be used more than once`)
})

it(`required components are provided when added`, () => {

    const f1 = feathers
        .add(TestBuild)
        .add(TestRequire)

    expect(f1.components[1].components).toEqual([f1.components[0]])
})