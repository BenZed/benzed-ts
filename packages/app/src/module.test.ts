import { nil } from '@benzed/util'
import { App } from './app'
import { Module, ExecutableModule } from './module'

import { Service, ServiceModule } from './service'

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
*/

//// Setup ////

class Test extends Module {

}

//// Tests ////

it('.start() cannot be called consecutively', async () => {
    const test = new Test()
    try {
        await test.start()
        await test.start()
    } catch (e: any) {
        expect(e.message).toContain(`${test.name} has already been started`)
    }
    expect.assertions(1)
})

it('.stop() cannot be called until started', async () => {
    const test = new Test()
    try {
        await test.stop()
    } catch (e: any) {
        expect(e.message).toContain(`${test.name} has not been started`)
    }
    expect.assertions(1)
})

it('.stop() cannot be called consecutively', async () => {
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

it('.modules redirects to parent modules', () => {
    const service = Service.create()
    const m1 = new Test()

    const s1 = service.useModule(m1)

    const [m1c] = s1.modules
    expect(m1c.modules).toBe(s1.modules)
})

it('.modules is empty on modules with no parent', () => {
    const m1 = new Test()
    expect(m1.modules).toEqual([])
})

it('.getModule()', () => {

    const m1 = new Test()
    const m2 = new Test()

    const service = App.create()
        .useModule(m1)
        .useModule(m2)

    const m1f = service.getModule(Module)
    expect(m1f).toBeInstanceOf(Module)
})

it('.getModule() required param true', () => {

    const m1 = new Test()

    expect(() => m1.getModule(ServiceModule, true)).toThrow('is missing')
})

it('.getModule() required param false', () => {
    const m1 = new Test()
    expect(m1.getModule(Module)).toBe(nil)
})

it('.getModule() scope param "parents"', () => {

    const s1 = Service
        .create()
        .useModule(new Test())

    const s2 = s1.useService('/child', s1)
    
    const m = s2.modules[0].modules[0].getModule(Test, false, 'parents')
    expect(m).toBe(s2.modules[0])
})

it('.getModule() scope param "children"', () => {

    const s1 = Service
        .create()
        .useModule(new Test())

    const s2 = Service.create().useService('/child', s1)
    
    const m = s2.getModule(Test, false, 'children')
    expect(m).toBe(s2.modules[0].modules[0])
})

it('.getModule() predicate', () => {

    const s1 = Service
        .create()
        .useModule(new Test())

    const s2 = Service.create().useService('/child', s1)
    
    const m = s2.getModule(i => i instanceof Test, false, 'children')
    expect(m).toBe(s2.modules[0].modules[0])
})

it('.hasModule()', () => {

    const service = Service.create()
    const m1 = new Test()

    expect(service.hasModule(Module)).toBe(false)
    expect(service.useModule(m1).hasModule(Module)).toBe(true)
})

it('.parent', () => {
    
    const app = App.create().useModule(new Module())
    const service = app.modules[0]
    expect(service.parent).toBe(app)

})

it('.root', () => {

    const service = Service.create().useModule(new Module())

    const app = App.create().useModule(service.useService('/eh', service))
    const child = app.modules[0].modules[0]
    expect(child.root).toBe(app)
})

it('callable module', () => {
    const executable = new ExecutableModule((x: { foo: string }) => ({ ...x, count: 0 }))
    expect(executable({ foo: 'string' })).toEqual({ foo: 'string', count: 0 })
})