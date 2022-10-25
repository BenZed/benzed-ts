import { $ } from '@benzed/schema'

import { BuildComponent } from './build-component'
import { builder } from './builder'

import { Services, Service, ServicesOf, Config, ConfigOf, Extends, ExtendsOf } from '../types'
import { ToBuildEffect } from './types'

import { expectTypeOf } from 'expect-type'

/*** Types ***/

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
*/

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

class Servicer<S extends Services> extends BuildComponent<ToBuildEffect<{ services: S }>> {

    requirements = undefined

    constructor(
        public services: ToBuildEffect<{ services: S }>['services']
    ) {
        super()
    }

    protected _createBuildEffect(): ToBuildEffect<{ services: S }> {
        const { services } = this
        return { services }
    }

}

class Extender<E extends Extends<any>> extends BuildComponent<ToBuildEffect<{ extends: E }>> {

    requirements = undefined
    extends: E

    constructor(
        e: Exclude<ToBuildEffect<{ extends: E }>['extends'], undefined>
    ) {
        super()
        this.extends = e
    }

    protected _createBuildEffect(): ToBuildEffect<{ extends: E }> {
        return { extends: this.extends }
    }

}

/*** Tests ***/

it(`makes typesafe changes to the output application config via build effects`, () => {

    const app = builder
        .add(new Configurer({ foo: $.string }))
        .add(new Configurer({ bar: $.number }))
        .build({ foo: `bar`, bar: 0 })

    expectTypeOf<ConfigOf<typeof app>>()
        .toEqualTypeOf<{ foo: string, bar: number }>()

    expect(app.get(`foo`)).toBe(`bar`)
})

it(`makes typesafe changes to the output application services via build effects`, () => {

    interface Todo {
        complete: boolean
    }

    const app = builder.add(
        new Servicer({
            todos: () => ({ get() {
                return null 
            }}) as unknown as Service<Todo>
        })
    ).build()

    expectTypeOf<ServicesOf<typeof app>>().toEqualTypeOf<{ todos: Service<Todo> }>()

    const service = app.service(`todos`)
    expect(service).toHaveProperty(`on`)
    expect(service).toHaveProperty(`get`)
    expect(service).toHaveProperty(`hooks`)
})

it(`makes typesafe changes to application extensions`, () => {
    
    const app = builder
        .add(new Configurer({
            logs: $.number
        }))
        .add(new Extender({
            log(...args: unknown[]): void {
                void args
            }
        }))
        .build({ logs: 100 })

    type E = ExtendsOf<typeof app>
    expectTypeOf<ExtendsOf<E>>()
        .toEqualTypeOf<{ log: (...args: unknown[]) => void }>()

    expect(app.log).not.toThrow()
})