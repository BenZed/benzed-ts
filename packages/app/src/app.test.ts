import { io } from '@benzed/util'
import { expectTypeOf } from 'expect-type'

import { App } from './app'
import { ModuleWithSettings } from './module'
import { Client, Server } from './modules'
import { Service } from './service'
import { Path } from './types'

/*** Tests ***/

it(`is sealed`, () => {
    // @ts-expect-error Cannot be extended
    void class extends App {}
})

it(`.create() to create a connection-less app`, () => {
    const app = App.create()
    expect(app).toBeInstanceOf(App)
})

it(`.server() to convert to a server app`, () => {
    const app = App.create().server()
    expect(app.type).toBe(`server`)
})

it(`.server() creates an immutable copy`, () => {

    const generic = App.create()
    const server = generic.server()
    expect(server).not.toBe(generic)
})

it(`.client() to start an app with a client connection`, () => {
    const app = App.create().client()

    expect(app.type).toBe(`client`)
})

it(`connection shortcuts automatically remove previous connection`, () => {
    const app = App.create().client().use(new ModuleWithSettings({})).client()

    expect(app.modules.length).toBe(2)

    type DummyClient = typeof app 
    type Modules = DummyClient extends App<infer M> ? M : unknown 

    expectTypeOf<Modules>().toEqualTypeOf<[ModuleWithSettings<object>, Client]>()

})

it(`created modules are parented to the app`, () => {
    const app = App.create().client().use(new ModuleWithSettings({}))

    expect(app.modules.every(m => m.parent === app))
        .toBe(true)
})

it(`.start() cannot be called consecutively`, async () => {
    const app = App.create().server()

    await app.start()
    const err = await app.start().catch(io)
    await app.stop()

    expect(err.message).toContain(`${app.name} has already been started`)
})

it(`.service() to remove connections`, () => {
    const app = App.create().client().use(new ModuleWithSettings({})).service()

    type DummyClient = typeof app 
    type Modules = DummyClient extends Service<Path, infer M> ? M : unknown 
    expectTypeOf<Modules>().toEqualTypeOf<[ModuleWithSettings<object>]>()

    expect(app.modules.length).toBe(1)
})

it(`.stop() cannot be called until started`, async () => {
    const app = App.create().server()

    const err = await app.stop().catch(io)
    expect(err.message).toContain(`${app.name} has not been started`)
})

it(`.stop() cannot be called consecutively`, async () => {
    const app = App.create().server()

    await app.start()
    await app.stop()
    const err = await app.stop().catch(io)
    expect(err.message).toContain(`${app.name} has not been started`)
})

it(`.type === null before started`, () => {
    const app = App.create()
    expect(app.type).toBe(null)
})

it(`connection is typesafe`, () => {

    const client = App.create().client().connection
    expectTypeOf<typeof client>().toMatchTypeOf<Client>()

    const server = App.create().server().connection
    expectTypeOf<typeof server>().toMatchTypeOf<Server>()
})

it.todo(`execute`)