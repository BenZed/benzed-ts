import { $ } from '@benzed/schema'

import { BuildComponent } from './build-component'
import { builder } from './builder'

import { ServicesOf, Config, ConfigOf, Extends, ExtendsOf, Services } from '../types'
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

class Servicer<S extends Services = any> extends BuildComponent<ToBuildEffect<{ services: S }>> {

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

const extenderReq = BuildComponent.requirements<[Servicer<any>], false>(false, Servicer)

type ExtenderRequirements = typeof extenderReq

type ExtenderExtends = Extends<ExtenderRequirements>
class Extender<E extends ExtenderExtends> extends BuildComponent<{ extends: E }, ExtenderRequirements> {

    requirements = extenderReq

    extends: E

    constructor(
        e: E
    ) {
        super()
        this.extends = e
    }

    protected _createBuildEffect(): { extends: E } {
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

    const app = builder.add(
        new Servicer({
            todos: () => ({ 
                get() {
                    return Promise.resolve({ complete: true }) 
                }
            })
        })
    ).build()

    type TodoApp = typeof app

    type TodoAppServices = ServicesOf<TodoApp>

    expectTypeOf<TodoAppServices>().toEqualTypeOf<{ todos: { get(): Promise<{ complete: boolean }> } }>()

    const service = app.service(`todos`)
    expect(service).toHaveProperty(`on`)
    expect(service).toHaveProperty(`get`)
    expect(service).toHaveProperty(`hooks`)
})

it(`makes typesafe changes to application extensions`, () => {

    const app = builder
        .add(
            new Configurer({
                logs: $.number
            })
        )
        .add(
            new Servicer({
                todos: () => ({ 
                    get() {
                        return Promise.resolve({ todo: true })
                    }
                })
            })
        )
        .add( 
            new Extender({
                log(...args: unknown[]): void {
                    void args
                    void this
                }
            })
        )
        .build({ logs: 100 })

    type E = ExtendsOf<typeof app>
    expectTypeOf<E>().toEqualTypeOf<{ log: (...args: unknown[]) => void }>()

    expect(app.log).not.toThrow()
})