import { calculator } from './util.test'
import { App, Client, Server } from '../src'

//// Setup ////

for (const webSocketClient of [true, false]) {
    for (const webSocketServer of [true, false]) {

        describe(`websocket ${webSocketClient ? 'enabled' : 'disabled'} on client, ${webSocketServer ? 'enabled' : 'disabled'} on server`, () => {

            const app = App.create().useModule(calculator)

            const client = app.useModule(Client.create({ webSocket: webSocketClient }))
            const server = app.useModule(Server.create({ webSocket: webSocketServer }))
        
            beforeAll(() => server.start())
            beforeAll(() => client.start())
        
            afterAll(() => server.stop())
            afterAll(() => client.stop())

            //// Tests ////
        
            for (const [{ name, ...data }, output] of [

                [ { name: 'add' , a: 10, b: 10 }, { result: 20 } ],
                [ { name: 'multiply' , a: 10, b: 10 }, { result: 100 } ],
                [ { name: 'divide' , a: 10, b: 10 }, { result: 1 } ],
                [ { name: 'subtract' , a: 10, b: 10 }, { result: 0 } ],

            ] as const) {
                it(`calculator ${name} test ${data} should result in ${JSON.stringify(output)}`, async () => {

                    const command = client.getCommand(name)
                    const result = await command.execute(data)
                    expect(result).toEqual(output)
                })
            }
        })
    }
}