import { inputToOutput, toNull } from '@benzed/util'

import { Command } from "../command"
import { Client, DEFAULT_CLIENT_SETTINGS } from "./client"
import { Server, DEFAULT_SERVER_SETTINGS } from "./server"

const log: Command[] = []

let server: Server
beforeAll(async () => {
    server = new Server(DEFAULT_SERVER_SETTINGS)
    server[`_relayCommand`] = (_ctx, cmd) => void log.push(cmd) ?? Promise.resolve(cmd)
    server.getCommandList = () => Promise.resolve([`get-test`])
    await server.start()
})

afterAll(async () => {
    await server.stop()
})

let client: Client
let connectErr: Error | null = null
let commandList: string[]
beforeAll(async () => {
    client = new Client(DEFAULT_CLIENT_SETTINGS)
    connectErr = await client
        .start()
        .then(toNull)
        .catch(inputToOutput)

    commandList = await client.getCommandList().catch(inputToOutput)
})

afterAll(async () => {
    await client.stop()
})

it(`creates connections to the server`, () => {
    expect(connectErr).toEqual(null)
})

it(`getServerCommandList() retreives a list of server commands`, () => {
    expect(commandList).toEqual([`get-test`])
})

it(`server receives client commands`, async () => {

    // since the server isn't connected to an app for this test, it sends
    const result = await client.executeOnServer({ name: commandList[0] })

    expect(result).toEqual({ name: commandList[0] })

    expect(log).toEqual([result])
})
