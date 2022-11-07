import { App } from '../src/app'
import { 
    Client, 
    Database, 
    Server 
} from '../src/modules'

const app = App
    .create()
    .useModule(
        Database.create({ 
            database: 'db-test'
        })
    )

const server = app
    .useModule(
        Server.create()
    )

const client = app
    .useModule(
        Client.create()
    )

beforeAll(() => server.start())

beforeAll(() => client.start())

afterAll(() => server.stop())

// We're going to do an exhaustive query test here
it('mongo db app connects to a database', () => {

    const { commands } = client

    console.log(commands)
})