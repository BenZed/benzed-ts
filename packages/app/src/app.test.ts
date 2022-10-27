import { io } from '@benzed/util'

import { App } from './app'
import { Server } from './connection'

import { expectTypeOf } from 'expect-type'

/*** Tests ***/

it(`is sealed`, () => {
    // @ts-expect-error Cannot be extended
    void class extends App {}

    // @ts-expect-error Cannot be instances
    void new App()
})

it(`.create() to create an app`, () => {
    const app = App.create()

    expect(app).toBeInstanceOf(App)
})

it(`.start() to start an app with a server connection`, async () => {
    const app = App.create()

    await app.start(new Server())

    expect(app.type).toBe(`server`)

    await app.stop()
})

it(`.start() cannot be called consecutively`, async () => {
    const app = App.create()

    await app.start(new Server())

    const err = await app.start(new Server()).catch(io)

    expect(err.message).toContain(`has already been started as a server`)
})

it(`.stop() cannot be called until started`, async () => {
    const app = App.create()

    const err = await app.stop().catch(io)
    expect(err.message).toContain(`has not yet been started`)
})

it(`.type === null before started`, () => {
    const app = App.create()
    expect(app.type).toBe(null)
})