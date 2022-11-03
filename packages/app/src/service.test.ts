import $, { Infer } from '@benzed/schema'

import { App } from './app'
import { Module } from './module'

import { expectTypeOf } from 'expect-type'
import { Service } from './service'
import { Path } from './types'

import { Command } from './command'

//// Tests ////

describe('.useService(path)', () => {

    const app = App.create().useModule(new Module())

    const todoApp = app.useService('/todos', Service.create())

    it('places one as a module of the other', () => {
        expect(app.modules[0].parent)
            .toBe(app)
    })

    it('can place nested services at different endpoints', () => {
        expect(todoApp.modules[1].path)
            .toBe('/todos')
    })
})

describe('.commands', () => {

    interface OrderId extends Infer<typeof $orderId> {}
    const $orderId = $({
        id: $.string
    })

    interface OrderData extends Infer<typeof $orderData> {}
    const $orderData = $({
        type: $.string
    })

    interface Order extends Infer<typeof $order> {}
    const $order = $({
        ...$orderId.$,
        ...$orderData.$
    })

    class Orders extends Module {

        private readonly _orders: Order[] = []
        get orders(): readonly Order[] {
            return this._orders
        }

        find(id: string): Order | null {
            return this.orders.find(order => order.id === id) ?? null
        }

        create(data: OrderData): Order {
            const order = { ...data, id: Date.now().toString() }
            this._orders.push(order)
            return order
        }

    }

    // function hook(hookF: (this: RuntimeCommand<OrderId>)

    const getOrder = Command
        .get<OrderId>($orderId)
        .useHook(function ({ id }) {
            const orders = this.getModule(Orders, true)
            const order = orders.find(id)
            return { order }
        })

    const createOrder = Command
        .create<OrderData>($orderData)
        .useHook(function ({ type }) {

            const orders = this.getModule(Orders, true)

            return {
                order: orders.create({ type })
            }
        })

    it('gets all commands attached to modules', () => {

        const restaurant = App.create()
            .useModule(new Orders())
            .useModule(getOrder)
            .useModule(createOrder)

        const { commands } = restaurant

        expectTypeOf(commands).toEqualTypeOf<{
            get: Command<'get',OrderId, { order: Order | null }>
            create: Command<'create',OrderData, { order: Order }>
        }>()

    })

    it('handles nesting', () => {

        const orders = Service
            .create()
            .useModule(new Orders)
            .useModule(createOrder)
            .useModule(getOrder)

        const bikes = Service.create().useModule(orders)

        const cars = Service.create()
            .useModule(orders)
            .useService(
                '/part',
                orders
            )

        const travel = App.create()
            .useModule(orders)
            .useService('/car', cars)
            .useService('/bike', bikes)

        const { commands } = travel

        expectTypeOf(commands).toEqualTypeOf<{
            create: Command<'create', OrderData, { order: Order }>
            get: Command<'get', OrderId, { order: Order | null }>
            carCreate: Command<'create', OrderData, { order: Order }>
            carGet: Command<'get', OrderId, { order: Order | null }>
            carPartCreate: Command<'create', OrderData, { order: Order }>
            carPartGet: Command<'get', OrderId, { order: Order | null }>
            bikeCreate: Command<'create', OrderData, { order: Order }>
            bikeGet: Command<'get', OrderId, { order: Order | null }>
        }>()

    })

    it('services using apps turns them into services', () => {

        const app = App.create()

        const service = Service.create().useService('/todos', app)
        const wasApp = service.modules[0]

        expectTypeOf(wasApp).toEqualTypeOf<Service<'/todos', []>>()
    })

    it('errors thrown if commands collide', () => {

        for (const path of ['', '/ace'] as Path[]) {
            for (const service of [App.create(), Service.create()]) {
                expect(() => {
                    
                    const app = (service as Service<Path>)
                        .useService(path, Service.create().useModule(createOrder))
                        .useService(path, Service.create().useModule(createOrder))

                }).toThrow('Command name collision')
            }
        }
    })
})