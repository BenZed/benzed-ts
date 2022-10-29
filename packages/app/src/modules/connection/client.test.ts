import { inputToOutput } from '@benzed/util'

import { Command } from "../../command"
import { Client, DEFAULT_CLIENT_SETTINGS } from "./client"
import { Server, DEFAULT_SERVER_SETTINGS } from "./server"

/*** Setup ***/

for (const webSocket of [false, true]) {

    describe(`websocket: ${webSocket}`, () => {
        const log: Command[] = []

        let server: Server
        beforeAll(async () => {
            server = new Server({ ...DEFAULT_SERVER_SETTINGS, webSocket })
            server[`_relayCommand`] = (cmd) => void log.push(cmd) ?? Promise.resolve(cmd)
            server.getCommandList = () => Promise.resolve([`get-test`])
            await server.start()
        })
    
        afterAll(async () => {
            await server.stop()
        })
    
        let client: Client
        let startErr: unknown
        let stopErr: unknown
        let commandList: string[]
        beforeAll(async () => {
            client = new Client({ ...DEFAULT_CLIENT_SETTINGS, webSocket })
            startErr = await client
                .start()
                .catch(inputToOutput)
    
            commandList = await client.getCommandList().catch(inputToOutput)
            stopErr = await client.stop().catch(inputToOutput)

            await client.start()
        }, 500)
    
        afterAll(async () => {
            await client.stop()
        })
    
        /*** Tests ***/
    
        it(`.start()`, () => {
            expect(startErr).toEqual(undefined)
        })
    
        it(`.stop()`, () => {
            expect(stopErr).toEqual(undefined)
        })
    
        it(`.getServerCommandList()`, () => {
            expect(commandList).toEqual([`get-test`])
        })
    
        it(`.executeOnServer()`, async () => {
    
            // since the server isn't connected to an app for this test, it sends
            const result = await client.executeOnServer({ name: commandList[0] })
            expect(result).toEqual({ name: commandList[0] })
    
            expect(log).toEqual([result])
        })
    
        it(`.type === "client"`, () => {
            expect(client.type).toBe(`client`)
        })
    })
}