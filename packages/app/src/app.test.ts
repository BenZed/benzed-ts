
import { App } from './app'
import { Client } from './modules'
import { SettingsModule } from './module'
import { expectTypeOf } from 'expect-type'
import { Service } from './service'

//// Tests ////

it(`is sealed`, () => {
    // @ts-expect-error Cannot be extended
    void class extends App {}
})

it(`.create()`, () => {
    const app = App.create()
    expect(app).toBeInstanceOf(App)
})

it(`used modules are parented`, () => {
    const app = App
        .create()
        .useModule(Client.create())
        .useModule(new SettingsModule({}))

    expect(app.modules.every(m => m.parent === app))
        .toBe(true)
})

it(`apps using apps turns them into services`, () => {

    const app = App
        .create()
        .useModule(`/users`, App.create())

    expectTypeOf(app.modules[0]).toMatchTypeOf<Service<'/users', []>>()
})