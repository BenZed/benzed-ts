import { $ } from '@benzed/schema'
import { Empty } from '@benzed/util'

import { feathers } from './builder'

import { ServicesOf, Config, ConfigOf, Extends, ExtendsOf, Services, App } from '../types'
import { ToBuildEffect } from './types'

import { expectTypeOf } from 'expect-type'
import FeathersBuildModule, { FeathersModule, FeathersModules } from './module'

/*** Types ***/

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
*/

/*** Setup ***/

class Configurer<S extends Config> extends FeathersBuildModule<ToBuildEffect<{ config: S }>> {

    requirements = undefined 

    constructor(
        modules: FeathersModules,
        public config: ToBuildEffect<{ config: S }>['config']
    ) {
        super(modules)
    }

    protected _createBuildEffect(): ToBuildEffect<{ config: S }> {
        const { config } = this
        return { config }
    }

}

class Servicer<S extends Services> extends FeathersBuildModule<ToBuildEffect<{ services: S }>> {

    requirements = undefined

    constructor(
        modules: FeathersModules, 
        public services: ToBuildEffect<{ services: S }>['services']
    ) {
        super(modules)
    }

    protected _createBuildEffect(): ToBuildEffect<{ services: S }> {
        const { services } = this
        return { services }
    }
}

type ExtenderExtends = Extends 
class Extender<E extends ExtenderExtends> extends FeathersBuildModule<{ extends: E }> {

    extends: E

    constructor(c: FeathersModules, e: E) {
        super(c)
        this.extends = e
    }

    protected _createBuildEffect(): { extends: E } {
        return { extends: this.extends }
    }

}

/*** Tests ***/

it(`makes typesafe changes to the output application config via build effects`, () => {

    const app = feathers
        .add(c => new Configurer(c, { foo: $.string }))
        .add(c => new Configurer(c, { bar: $.number }))
        .build({ foo: `bar`, bar: 0 })

    expectTypeOf<ConfigOf<typeof app>>().toEqualTypeOf<{ foo: string, bar: number }>()

    expect(app.get(`foo`)).toBe(`bar`)
})

it(`makes typesafe changes to the output application services via build effects`, () => {

    const app = feathers.add(c => new Servicer(c, {
        todos: () => ({ 
            get() {
                return Promise.resolve({ complete: true }) 
            }
        })
    })).build()

    type TodoApp = typeof app

    type TodoAppServices = ServicesOf<TodoApp>

    expectTypeOf<TodoAppServices>().toEqualTypeOf<{ todos: { get(): Promise<{ complete: boolean }> } }>()

    const service = app.service(`todos`)
    expect(service).toHaveProperty(`on`)
    expect(service).toHaveProperty(`get`)
    expect(service).toHaveProperty(`hooks`)
})

it(`makes typesafe changes to application extensions`, () => {

    const app = feathers
        .add(c => new Configurer(c, { logs: $.number }))
        .add(c => new Servicer(c, {
            todos: () => ({ 
                get() {
                    return Promise.resolve({ todo: true })
                }
            })
        }))
        .add(c => new Extender(c, {
            log(...args: unknown[]): void {
                void args
                void this
            }
        }))
        .build({ logs: 100 })

    type E = ExtendsOf<typeof app>
    expectTypeOf<E>().toEqualTypeOf<{ log: (...args: unknown[]) => void }>()

    expect(app.log).not.toThrow()
})

it(`lifecycle onConfigure method is called`, () => {

    let createCalled = 0
    let configCalled = 0
    class Easy extends FeathersModule {
        
        readonly requirements = undefined 

        protected _onCreate = (): void => {
            createCalled++
        }

        protected _onConfig = (): void => {
            configCalled++
        }
    }

    const app = feathers.add(Easy).build()

    expectTypeOf<typeof app>().toMatchTypeOf<App<Empty,Empty>>()

    expect(configCalled).toBe(1)
    expect(createCalled).toBe(1)

})