import { io } from '@benzed/util'

import { App } from './app'

/*** Tests ***/

it(`is sealed`, () => {
    // @ts-expect-error Cannot be extended
    void class extends App {}

    // @ts-expect-error Cannot be instances
    void new App()
})

it(`.create() to create a connection-less app`, () => {
    const app = App.create()

    expect(app).toBeInstanceOf(App)
})

it(`.server() to convert to a server app`, async () => {
    const app = App.create().server()

    await app.start()
    expect(app.type).toBe(`server`)
    await app.stop()
})

it(`.client() to start an app with a client connection`, async () => {
    const app = App.create().client()

    await app.start()
    expect(app.type).toBe(`client`)
    await app.stop()
})

it(`.start() cannot be called consecutively`, async () => {
    const app = App.create().server()

    await app.start()
    const err = await app.start().catch(io)
    expect(err.message).toContain(`Server already started`)
    await app.stop()
})

it(`.stop() cannot be called until started`, async () => {
    const app = App.create()

    const err = await app.stop().catch(io)
    expect(err.message).toContain(`App does not have a Connection instance.`)
})

it(`.stop() cannot be called consecutively`, async () => {
    const app = App.create().client()

    await app.start()
    await app.stop()
    const err = await app.stop().catch(io)
    expect(err.message).toContain(`client has not been started`)
})

it(`.type === null before started`, () => {
    const app = App.create()
    expect(app.type).toBe(null)
})