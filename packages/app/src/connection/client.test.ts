import { inputToOutput, pass, toNull } from '@benzed/util'

import { Command } from "../command"
import { Client, DEFAULT_CLIENT_SETTINGS } from "./client"
import { Server, DEFAULT_SERVER_SETTINGS } from "./server"

const log: Command[] = []

let server: Server
beforeAll(async () => {
    server = new Server(DEFAULT_SERVER_SETTINGS)
    server.execute = cmd => void log.push(cmd) ?? cmd
    server.canExecute = pass as unknown as typeof server.canExecute
    await server.start()
})

afterAll(async () => {
    await server.stop()
})

let client: Client
let connectErr: Error | null = null
beforeAll(async () => {
    client = new Client(DEFAULT_CLIENT_SETTINGS)
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
    const result = await client.execute({ name: `get-test` })
    expect(result).toEqual({ name: `hello` })
    expect(log).toEqual([result, result])
})
