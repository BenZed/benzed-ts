import { Link } from '@benzed/util'

import { Service } from '../src/service'

import { App } from '../src/app'
import { Command } from '../src/command'
import { 
    Client, 
    Database, 
    HttpMethod, 
    Server, 
    Record,

    WithId
} from '../src/modules'

//// Build App ////

const validate = <I extends object>(): { validate: Link<I,I> } => ({ validate: (i: I) => i })

const service = Service
    .create()
    .useModules(
        Command.create(validate<object>()).useDatabase(),
        Command.get(validate<WithId>()).useDatabase(),
        Command.remove(validate<WithId>()).useDatabase()
    )

const app = App
    .create()
    .useModules(
        Database.create({ database: 'db-test' }),
        Command
            .create('getDatabaseSettings', validate<object>(), HttpMethod.Get)
            .useHook(function() {
                const db = this.getModule(Database, true)
                return db.settings
            })
    )
    .useService('/todos', service.useService('/orders', service))
    .useService('/orders', service)

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
        .toEqual(['GET', '/get-database-settings', {}, null])

    const settings = await getDatabaseSettings.execute({})
    expect(settings).toEqual(app.modules[0].settings)
})

it('send client command from nested service', async () => {

    const nestedOrderService = client.modules[2].modules[3]

    const { _id, ...rest } = await nestedOrderService
        .commands
        .create
        .execute({ some: 'data', goes: 'here' }) as Record<object>

    expect(rest).toEqual({ some: 'data', goes: 'here' })
    expect(_id).toBeTruthy()

})