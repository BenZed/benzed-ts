import $ from '@benzed/schema'

import { App, Command, Service, MongoDb } from '../src'

import { HttpMethod } from '../src/util'

//// Setup ////  

const $empty = $({})

//// Database ////

const mongodb = MongoDb 
    .create({ database: 'db-test' }) 

const getSettings = Command
    .get($empty, (_, ctx) => ctx.node.assertModule.inAncestors(mongodb).data)
    .setReq(req => req.setUrl`/settings`)

const todosCollection = mongodb
    .createCollection('todos', { completed: $.boolean, description: $.string })

//// Services ////

const database = Service.create({ getSettings }).setModules(mongodb, todosCollection)

const todos = Service.create(todosCollection.createCommands()) 
 
//// App ////

const app = App.create({ 
    database, 
    todos
})

//// Server & Client ////   
    
const server = app.asServer({}) 

const client = app.asClient({})

beforeAll(() => server.start()) 
beforeAll(() => client.start())
afterAll(() => client.stop())
afterAll(() => server.stop())

// We're going to do an exhaustive query test here
it('mongo db app connects to a database', async () => {

    const { getSettings } = client.commands.database

    expect(getSettings.req.fromData({})).toEqual({
        method: HttpMethod.Get,
        url: '/settings', 
    })

    const settings = await getSettings({})

    expect(mongodb.data).toEqual(settings)
})

it('send client command from nested service', async () => {
    console.log(server.nodes.database.modules[0].isConnected)
    console.log(client.nodes.database.modules[0].isConnected)

    const { _id, ...rest } = await client
        .services
        .todos
        .commands
        .create({
            completed: false,
            description: 'Nested orders' 
        }) 

    expect(rest).toEqual({ completed: false, description: 'Nested orders' })
    expect(_id).toBeTruthy()

})