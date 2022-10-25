import { builder } from './builder'

import { Empty, through } from '@benzed/util'

import BuildComponent, { Requirements } from './build-component'

import { expectTypeOf } from 'expect-type'
import { App } from '../types'

/***  Eslint***/

/* eslint-disable 
    @typescript-eslint/no-explicit-any
*/

/*** Setup ***/

class TestBuild extends BuildComponent<Empty> {

    requirements = new Requirements(false)

    protected _createBuildEffect(): Empty {
        return {}
    }

}

class TestRequire extends BuildComponent<Empty> {

    readonly requirements = new Requirements(false, TestBuild)

    protected _createBuildEffect(): Empty {
        return {}
    }

}

class TestSingle extends BuildComponent<Empty> {

    readonly requirements = new Requirements(true)

    protected _createBuildEffect(): Empty {
        return {}
    }

}

/*** Tests ***/

it(`creates feathers applications`, () => {
    
    const app = builder
        .add(new TestBuild())
        .build()

    expectTypeOf<typeof app>().toMatchTypeOf<App>()
})

it(`throws if no components have been added`, () => {

    expect(() => builder.build())
        .toThrow(`Node must be created with at least one component`)

})

it(`add() must use build components`, () => {
 
    // @ts-expect-error not a build component
    builder.add({ compute: through })

})

it(`add() must respect build component requirements`, () => {

    // @ts-expect-error requires TestBuild
    expect(() => builder.add(new TestRequire()))
        .toThrow(`Requires component: ${TestBuild.name}`)

    expect(() => builder
        .add(new TestBuild())
        .add(new TestRequire())).not.toThrow(Error)

})

it(`add() must respect single build components`, () => {

    expect(() => builder
        .add(new TestSingle())
        // @ts-expect-error can only place this component once
        .add(new TestSingle())
    ).toThrow(`Component ${TestSingle.name} can only be added once`)
})

it(`required components are provided when added`, () => {

    const require = new TestRequire()
    const build = new TestBuild()

    builder
        .add(build)
        .add(require)

    expect(require.requirements.components).toEqual([build])
})