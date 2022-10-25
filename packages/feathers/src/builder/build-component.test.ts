import { $ } from '@benzed/schema'

import { BuildComponent } from './build-component'
import { builder } from './builder'

import { Config, ConfigOf } from '../types'
import { ToBuildEffect } from './types'

import { expectTypeOf } from 'expect-type'

/*** Types ***/

/*** Setup ***/

class Configurer<C extends Config> extends BuildComponent<ToBuildEffect<{ config: C }>> {

    requirements = undefined 

    constructor(
        public config: ToBuildEffect<{ config: C }>['config']
    ) {
        super()
    }

    protected _createBuildEffect(): ToBuildEffect<{ config: C }> {
        const { config } = this
        return { config }
    }

}

/*** Tests ***/

it(`makes typesafe changes to the output application via build effects`, () => {

    const app = builder
        .add(new Configurer({ foo: $.string }))
        .add(new Configurer({ bar: $.number }))
        .build({ foo: `bar`, bar: 0 })

    expectTypeOf<ConfigOf<typeof app>>()
        .toEqualTypeOf<{ foo: string, bar: number }>()
    
    expect(app.get(`foo`)).toBe(`bar`)
})
