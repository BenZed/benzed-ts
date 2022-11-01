
import { App } from './app'
import { Client } from './modules'
import { SettingsModule } from './module'

/*** Tests ***/

it(`is sealed`, () => {
    // @ts-expect-error Cannot be extended
    void class extends App {}
})

it(`.create()`, () => {
    const app = App.create()
    expect(app).toBeInstanceOf(App)
})

it(`used modules are parented`, () => {
    const app = App.create().use(Client.create()).use(new SettingsModule({}))

    expect(app.modules.every(m => m.parent === app))
        .toBe(true)
})
