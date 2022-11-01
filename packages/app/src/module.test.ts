import { App } from './app'
import { Module } from "./module"

import { Service } from './service'

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
*/

//// Setup ////

class Test extends Module {

}

//// Tests ////

it(`.start() cannot be called consecutively`, async () => {
    const test = new Test()
    try {
        await test.start()
        await test.start()
    } catch (e: any) {
        expect(e.message).toContain(`${test.name} has already been started`)
    }
    expect.assertions(1)
})

it(`.stop() cannot be called until started`, async () => {
    const test = new Test()
    try {
        await test.stop()
    } catch (e: any) {
        expect(e.message).toContain(`${test.name} has not been started`)
    }
    expect.assertions(1)
})

it(`.stop() cannot be called consecutively`, async () => {
    const test = new Test()
    try {
        await test.start()
        await test.stop()
        await test.stop()
    } catch (e: any) {
        expect(e.message).toContain(`${test.name} has not been started`)
    }
    expect.assertions(1)
})

it(`.modules redirects to parent modules`, () => {
    const service = Service.create()
    const m1 = new Test()

    const s1 = service.use(m1)

    const [m1c] = s1.modules
    expect(m1c.modules).toBe(s1.modules)
})

it(`.modules is empty on modules with no parent`, () => {
    const m1 = new Test()
    expect(m1.modules).toEqual([])
})

it(`.get() a module`, () => {

    const m1 = new Test()
    const m2 = new Test()

    const service = App.create()
        .use(m1)
        .use(m2)

    const m1f = service.get(Module)
    expect(m1f).toBeInstanceOf(Module)
})

it(`.get() returns null if no modules could be found`, () => {
    const m1 = new Test()
    expect(m1.get(Module)).toBe(null)
})

it(`.has() a module`, () => {

    const service = Service.create()
    const m1 = new Test()

    expect(service.has(Module)).toBe(false)
    expect(service.use(m1).has(Module)).toBe(true)
})

it(`.parent`, () => {
    
    const app = App.create().use(Service.create())

    const service = app.modules[0]

    expect(service.parent).toBe(app)

})

it(`.root`, () => {
    const app = App.create().use(Service.create().use(Service.create()))

    const child = app.modules[0].modules[0]

    expect(child.root).toBe(app)
})
