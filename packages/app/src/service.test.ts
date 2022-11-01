import { App } from './app'
import { command } from "./command"
import { Module } from "./module"

import { expectTypeOf } from 'expect-type'
import { Service } from './service'
import { Path } from './types'

//// Tests ////

describe(`.use(path)`, () => {
    const service = Service.create()

    const app = App.create().use(service)

    const todoApp = app.use(`/todos`, service)

    it(`places one as a module of the other`, () => {
        expect(app.modules[0].parent)
            .toBe(app)
    })

    it(`can place nested services at different endpoints`, () => {
        expect(todoApp.modules[1].path)
            .toBe(`/todos`)
    })
})

describe(`.commands`, () => {

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
        const { commands } = restaurant

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
        )
            .use(
                `/part`,
                Service.create().use(new Orders())
            )

        const travel = App.create()
            .use(new Orders())
            .use(`/car`, cars)
            .use(`/bike`, bikes)

        const {commands} = travel

        expectTypeOf(commands).toEqualTypeOf<{
            create: Orders['create']
            find: Orders['find']
            carCreate: Orders['create']
            carFind: Orders['find']
            carPartCreate: Orders['create']
            carPartFind: Orders['find']
            bikeCreate: Orders['create']
            bikeFind: Orders['find']
        }>()

    })

    it(`errors thrown if commands collide`, () => {

        for (const path of [``, `/ace`] as Path[]) {
            for (const service of [App.create(), Service.create()]) {
                expect(() => (service as Service<Path>)
                    .use(path, Service.create().use(new Orders()))
                    .use(path, Service.create().use(new Orders()))
                ).toThrow(`Command name collision`)
            }
        }
    })
})