import { inputToOutput } from '@benzed/util'

import { Command } from "../../command"
import { Client } from "./client"
import { Server} from "./server"

/*** Setup ***/

for (const webSocket of [false, true]) {

    describe(`websocket: ${webSocket}`, () => {
        const log: Command[] = []

        let server: Server
        beforeAll(async () => {
            server = Server.create({ webSocket })
            server[`_relayCommand`] = (cmd: Command) => void log.push(cmd) ?? Promise.resolve(cmd)
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
            client = Client.create({ webSocket })
            startErr = await client
                .start()
                ?.catch(inputToOutput)
    
            commandList = await client.getCommandList().catch(inputToOutput)
            stopErr = await client.stop()?.catch(inputToOutput)

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
    
        it.todo(`.executeOnServer()`)
    
        it(`.type === "client"`, () => {
            expect(client.type).toBe(`client`)
        })
    })
}