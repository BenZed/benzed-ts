
import { App } from './app'
import { Client } from './modules'
import { Module, SettingsModule } from './module'
import { expectTypeOf } from 'expect-type'
import { Service } from './service'

//// Tests ////

it('is sealed', () => {
    // @ts-expect-error Cannot be extended
    void class extends App {}
})

it('.create()', () => {
    const app = App.create()
    expect(app).toBeInstanceOf(App)
})

it('used modules are parented', () => {
    const app = App
        .create()
        .useModule(Client.create())
        .useModule(new SettingsModule({}))

    expect(app.modules.every(m => m.parent === app))
        .toBe(true)
})

it('using a service as a module takes it\'s modules', () => {

    const service = Service.create().useModule(new Module()).useModule(new Module())

    const app = App.create().useModule(service)
    
    expectTypeOf(app).toMatchTypeOf<App<[Module, Module]>>()
    expect(app.modules.length).toBe(2)

})

it('apps using apps turns them into services', () => {

    const app = App
        .create()
        .useService('/users', App.create())

    expectTypeOf(app.modules[0]).toMatchTypeOf<Service<'/users', []>>()
})