import { Client, DEFAULT_CLIENT_OPTIONS } from "./client"
import { Server, DEFAULT_SERVER_OPTIONS } from "./server"

let server: Server
beforeAll(async () => {
    server = new Server([], DEFAULT_SERVER_OPTIONS, i => i)
    await server.start()
})

afterAll(async () => {
    await server.stop()
})

it(`creates connections to the server`, async () => {

    const client = new Client([], DEFAULT_CLIENT_OPTIONS)

    await client.start()
    await client.stop()
})