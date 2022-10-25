import { feathers } from './builder'

import { Empty, through } from '@benzed/util'

import FeathersComponent from './component'

import { expectTypeOf } from 'expect-type'
import { App } from '../types'

/***  Eslint***/

/* eslint-disable 
    @typescript-eslint/no-explicit-any
*/

/*** Setup ***/

class TestBuild extends FeathersComponent<Empty> {

    requirements = undefined

    protected _createBuildEffect(): Empty {
        return {}
    }

}

const testReq = FeathersComponent.requirements(false, TestBuild)

class TestRequire extends FeathersComponent<Empty, typeof testReq> {

    readonly requirements = testReq

    protected _createBuildEffect(): Empty {
        return {}
    }

}

const testSingleReq = FeathersComponent.requirements(true)

class TestSingle extends FeathersComponent<Empty, typeof testSingleReq> {

    readonly requirements = testSingleReq

    protected _createBuildEffect(): Empty {
        return {}
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
 
    // @ts-expect-error not a build component
    feathers.add({ compute: through })

})

it(`add() must respect build component requirements`, () => {

    // @ts-expect-error requires TestBuild
    expect(() => feathers.add(new TestRequire()))
        .toThrow(`Requires component: ${TestBuild.name}`)

    expect(() => feathers
        .add(new TestBuild())
        .add(new TestRequire())).not.toThrow(Error)

})

it(`add() must respect single build components`, () => {

    expect(() => feathers
        .add(new TestSingle())
        // @ts-expect-error can only place this component once
        .add(new TestSingle())
    ).toThrow(`Component ${TestSingle.name} can only be added once`)
})

it(`required components are provided when added`, () => {

    const require = new TestRequire()
    const build = new TestBuild()

    feathers
        .add(build)
        .add(require)

    expect(require.requirements.components).toEqual([build])
})