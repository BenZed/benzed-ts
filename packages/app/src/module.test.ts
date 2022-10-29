import { Module, Service } from "./module"
import { App } from './app'

const m1 = new Module({})
const m2 = new Module({})

const service = App.create()

/*** Tests ***/

it(`.use() to add module as immutable copy`, () => {
    const app = App.create().use(m1)
    expect(app.has(Module)).toBe(true)

    const [m1c] = app.modules
    expect(m1c).not.toBe(m1)
})

it(`.use() sets parent`, () => {

    const app = service
        .server()
        .use(m1)

    const [m1c] = app.modules
    expect(m1c.parent).toBe(app)
    expect(m1.parent).toBe(null)
})

it(`.modules redirects to parent modules`, () => {
    const s1 = service.use(m1)

    const [m1c] = s1.modules
    expect(m1c.modules).toBe(s1.modules)
})

it(`.modules is empty on modules with no parent`, () => {
    expect(m1.modules).toEqual([])
})

it(`.get() a module`, () => {
    const service = App.create()
        .use(m1)
        .use(m2)

    const m1f = service.get(Module)
    expect(m1f).toBeInstanceOf(Module)
})

it(`.get() returns null if no modules could be found`, () => {
    const m = m1.get(Module)
    expect(m).toBe(null)
})

it(`.has() a module`, () => {
    expect(service.has(Module)).toBe(false)
    expect(service.use(m1).has(Module)).toBe(true)
})

it(`.withSettings() makes an immutable copy with new settings`, () => {

    const s1 = new Module({ logIcon: `!` })
    const s2 = s1.withSettings({ logIcon: `!!` }) 

    expect(s1).not.toBe(s2)
    expect(s2.settings).toEqual({ logIcon: `!!` })
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

describe(`.use(path)`, () => {

    const app = App.create().server()
    const appWithService = app.use(service)
    const appWithServiceEndpoint = app.use(`todos`, service)

    it(`places one as a module of the other`, () => {
        expect(appWithService.modules[1].parent)
            .toBe(appWithService)
    })

    it(`can place nested services at different endpoints`, () => {
        expect(appWithServiceEndpoint.modules[1].path)
            .toBe(`todos`)
    })
})
