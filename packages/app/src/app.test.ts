import { io } from '@benzed/util'
import { expectTypeOf } from 'expect-type'

import { App } from './app'
import { Client, Connection } from './connection'
import { Module } from './modules'

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

it(`.client() to start an app with a client connection`, () => {
    const app = App.create().client()

    expect(app.type).toBe(`client`)
})

it(`connection shortcuts automatically remove previous connection`, () => {
    const app = App.create().client().use(new DummyModule({})).client()

    expect(app.modules.length).toBe(2)

    type DummyClient = typeof app 
    type Modules = DummyClient extends App<infer M> ? M : unknown 

    expectTypeOf<Modules>().toEqualTypeOf<[DummyModule, Client]>()

})

it(`created modules are parented to the app`, () => {
    const app = App.create().client().use(new DummyModule({}))

    expect(app.modules.every(m => m.parent === app)).toBe(true)
})

it(`.start() cannot be called consecutively`, async () => {
    const app = App.create().server()

    await app.start()
    const err = await app.start().catch(io)
    await app.stop()

    expect(err.message).toContain(`${app.type} has already been started`)
})

it(`.stop() cannot be called until started`, async () => {
    const app = App.create()

    const err = await app.stop().catch(io)
    expect(err.message).toContain(`${App.name} is missing module ${Connection.name}`)
})

it(`.stop() cannot be called consecutively`, async () => {
    const app = App.create().server()

    await app.start()
    await app.stop()
    const err = await app.stop().catch(io)
    expect(err.message).toContain(`${app.type} has not been started`)
})

it(`.type === null before started`, () => {
    const app = App.create()
    expect(app.type).toBe(null)
})

class DummyModule extends Module {
}

it(`.use() to add components`, () => {
    const app = App.create().use(new DummyModule({}))
    expect(app.has(DummyModule)).toBe(true)
})
