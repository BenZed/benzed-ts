import { calculator } from './util.test'
import { Client, Server } from '../src'

import { it, expect, describe, beforeAll, afterAll } from '@jest/globals'

//// Setup //// 

for (const webSocketClient of [true, false]) {
    for (const webSocketServer of [true, false]) { 

        describe(`websocket ${webSocketClient ? 'enabled' : 'disabled'} on client, ${webSocketServer ? 'enabled' : 'disabled'} on server`, () => {
            const server = calculator.useModule(Server.create({ webSocket: webSocketServer }))
            const client = calculator.useModule(Client.create({ webSocket: webSocketClient }))
            // 
  
            beforeAll(() => server.start())
            beforeAll(() => client.start())
            
            afterAll(() => client.stop())
            afterAll(() => server.stop())

            //// Tests //// 
        
            for (const [{ name, ...data }, output] of [

                [ { name: 'add', a: 10, b: 10 }, { result: 20 } ],
                [ { name: 'multiply', a: 10, b: 10 }, { result: 100 } ],
                [ { name: 'divide', a: 10, b: 10 }, { result: 1 } ],
                [ { name: 'subtract', a: 10, b: 10 }, { result: 0 } ],

            ] as const) { 

                it(`calculator ${name} test ${JSON.stringify(data)} should result in ${JSON.stringify(output)}`, async () => {
                    const command = client.getCommand(name)
                    const result = await command.execute(data)
                    expect(result).toEqual(output)
                })
            }
        })
    }
}