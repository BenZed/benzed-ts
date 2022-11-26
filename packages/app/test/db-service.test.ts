import { Schematic } from '@benzed/schema'

import { Service } from '../src/service'

import { App } from '../src/app'
import { Command } from '../src/command'
import { 
    Client, 
    Server, 
    Record,

    WithId,
    MongoDb
} from '../src/modules'

import { HttpMethod } from '../src/util'

//// Build App ////

const dummySchematic = <I extends object>(): Schematic<I> => ({ 
    validate: i => i as I, 
    is: (i): i is I => true, 
    assert: i => void i
})

const crudService = Service
    .create()
    .useModules(
        Command.create(dummySchematic<object>()),
        Command.get(dummySchematic<WithId>()),
        Command.remove(dummySchematic<WithId>()),
    )

const app = App
    .create()
    .useModules(
        MongoDb.create({ database: 'db-test' }),
        Command
            .create(
                'getDatabaseSettings', 
                dummySchematic<object>(), 
                HttpMethod.Get
            )
            .useHook(function() {
                const db = this.getModule(MongoDb, true)
                return db.settings
            })
    )
    .useService('/todos', crudService.useService('/orders', crudService))
    .useService('/orders', crudService)

//// Server & Client ////
    
const server = app
    .useModule(
        Server.create()
    )

const client = app
    .useModule(
        Client.create({ webSocket: false })
    )

beforeAll(() => server.start())

beforeAll(() => client.start())

afterAll(() => server.stop())

// We're going to do an exhaustive query test here
it('mongo db app connects to a database', async () => {

    const { getDatabaseSettings } = client.commands

    expect(getDatabaseSettings.toRequest({}))
        .toEqual({
            method: HttpMethod.Get,
            url: '/get-database-settings',
        })

    const settings = await getDatabaseSettings.execute({})

    expect(settings)
        .toEqual(app.modules[0].settings)
})

it.skip('send client command from nested service', async () => {

    const nestedOrderService = client.modules[2].modules[3]

    const { _id, ...rest } = await nestedOrderService
        .commands
        .create
        .execute({ 
            some: 'data', 
            goes: 'here'
        }) as Record<object>

    expect(rest).toEqual({ some: 'data', goes: 'here' })
    expect(_id).toBeTruthy()

})