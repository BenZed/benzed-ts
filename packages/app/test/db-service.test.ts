import { App } from '../src/app'
import { 
    Client, 
    Database, 
    DatabaseOperation, 
    Server 
} from '../src/modules'

const app = App
    .create()
    .useModule(
        Database.create({ 
            database: 'db-test'
        })
    ).useModule(
        DatabaseOperation.create({
            collection: 'users'
        }, 'get', 'find', 'remove')
    )

const server = app
    .useModule(
        Server.create()
    )

const client = app
    .useModule(
        Client.create()
    )

beforeAll(async () => {
    await server.start()
})

beforeAll(async () => {
    await client.start()
})

afterAll(async () => {
    await server.stop()
})

// afterAll(async () => {
//     await client.stop()
// })

// We're going to do an exhaustive query test here
it('mongo db app connects to a database', async () => {

    const { commands } = client

    console.log(commands)
})