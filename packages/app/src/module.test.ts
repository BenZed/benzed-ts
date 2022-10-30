import { Module, Service } from "./module"
import { App } from './app'
import { Command, command } from "./command"

import { expectTypeOf } from 'expect-type'
import { Compile } from "@benzed/util/lib"

/***  ***/

const m1 = new Module()
const m2 = new Module()

const service = Service.create()

/*** Tests ***/

it(`.use() to add module as immutable copy`, () => {
    const app = App.create().use(m1)
    expect(app.has(Module)).toBe(true)

    const [m1c] = app.modules
    expect(m1c).not.toBe(m1)
})

it(`.use() sets parent`, () => {

    const app = App.create().server().use(m1)

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
    const appWithServiceEndpoint = app.use(`/todos`, service)

    it(`places one as a module of the other`, () => {
        expect(appWithService.modules[1].parent)
            .toBe(appWithService)
    })

    it(`can place nested services at different endpoints`, () => {
        expect(appWithServiceEndpoint.modules[1].path)
            .toBe(`todos`)
    })
})

describe(`.getCommands()`, () => {

    class Orders extends Module {

        private _id = 0
        private readonly _orders: { type: string, id: string }[] = []

        create = command((data: { type: string }) => {

            const order = {
                type: data.type,
                id: `${this._id++}`
            }

            return Promise.resolve(order)
        })

        find = command((data: { id: string }) => {

            const order = this._orders.find(o => o.id === data.id) ?? null

            return Promise.resolve({ order })
        })

    }

    it(`gets all commands attached to modules`, () => {

        const italian = new Orders()
        const restaurant = App.create().use(italian)
        const commands = restaurant.getCommands()

        for (const key in commands)
            expect(italian).toHaveProperty(key, italian[key as keyof typeof italian])

        expectTypeOf<typeof commands>()
            .toEqualTypeOf<{
                create: typeof italian.create
                find: typeof italian.find
            }>

    })

    it(`handles nesting`, () => {

        const bikes = Service.create().use(
            new Orders()
        )

        const cars = Service.create().use(
            new Orders()
        ).use(
            `/part`,
            Service.create().use(new Orders())
        )

        const travel = App.create()
            .use(new Orders())
            .use(`/car`, cars)
            .use(`/bike`, bikes)

        const commands = travel.getCommands()

        console.log(commands)

        // type TravelCommands = Compile<typeof commands, Command, false>

        // expectTypeOf(commands).toEqualTypeOf<{
        //     find: Orders['find']
        //     ceate: Orders['create']
        //     carsFind: Orders['find']
        //     carsCreate: Orders['create']
        //     bikesFind: Orders['find']
        //     bikesCreate: Orders['create']
        // }>()

    })

})