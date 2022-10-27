import { inputToOutput, toNull } from '@benzed/util'

import { Command } from "../command"
import { Client, DEFAULT_CLIENT_OPTIONS } from "./client"
import { Server, DEFAULT_SERVER_OPTIONS } from "./server"

const log: Command[] = []

let server: Server
beforeAll(async () => {
    server = new Server([], DEFAULT_SERVER_OPTIONS, cmd => void log.push(cmd) ?? cmd)
    await server.start()
})

afterAll(async () => {
    await server.stop()
})

let client: Client
let connectErr: Error | null = null
beforeAll(async () => {
    client = new Client([], DEFAULT_CLIENT_OPTIONS)
    connectErr = await client
        .start()
        .then(toNull)
        .catch(inputToOutput)
})

afterAll(async () => {
    await client.stop()
})

it(`creates connections to the server`, () => {
    expect(connectErr).toEqual(null)
})

it(`server receives client commands`, async () => {
    const result = await client.compute({ name: `test` })
    expect(result).toEqual({ name: `test` })
    expect(log).toEqual([result])
})
