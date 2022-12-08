import $ from '@benzed/schema'
import { Empty } from '@benzed/util'

import { App, Command, Service, Client, Server, MongoDb } from '../src'

import { HttpMethod } from '../src/util'

//// Build App ////

const mongoDb = MongoDb
    .create({ database: 'db-test' })
    .addCollection('todos', $({
        completed: $.boolean,
        description: $.string
    }))

const getDbSettings = Command
    .create(
        'getDatabaseSettings', 
        (_: Empty, cmd) => cmd.getModule(MongoDb, true).settings,
        HttpMethod.Get        
    )

const todoCmds = mongoDb.createRecordCommands('todos')

const todoService = Service
    .create()
    .useModules(...todoCmds)

const app = App
    .create()
    .useModules(
        mongoDb,
        getDbSettings
    )
    .useService('/todos', todoService.useService('/orders', todoService))
    .useService('/orders', todoService)

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
afterAll(() => client.stop())
afterAll(() => server.stop())

// We're going to do an exhaustive query test here
it('mongo db app connects to a database', async () => {

    const { getDatabaseSettings } = client.commands

    expect(getDatabaseSettings.request.from({}))
        .toEqual({
            method: HttpMethod.Get,
            url: '/get-database-settings', 
        })

    const settings = await getDatabaseSettings({})

    const db = app.getModule(MongoDb, true)

    expect(settings)
        .toEqual(db.settings)
})

it('send client command from nested service', async () => {

    const nestedOrderService = client.getService('/todos/orders')
 
    const { _id, ...rest } = await nestedOrderService
        .commands
        .create({
            completed: false,
            description: 'Nested orders'
        }) 

    expect(rest).toEqual({ completed: false, description: 'Nested orders' })
    expect(_id).toBeTruthy()

})