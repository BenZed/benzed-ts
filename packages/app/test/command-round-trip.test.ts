import { $ } from '@benzed/schema'

import { Command, App } from '../src'

import { it, expect, describe, beforeAll, afterAll } from '@jest/globals'

//// Setup //// 

const math = Command.get({
    a: $.number,
    b: $.number
})

const add = math.appendHook(({ a, b }) => ({ result: a + b }))
const subtract = math.appendHook(({ a, b }) => ({ result: a - b }))
const divide = math.appendHook(({ a, b }) => ({ result: a / b }))
const multiply = math.appendHook(({ a, b }) => ({ result: a * b }))

const calculator = App.create({
    add,
    subtract,
    divide,
    multiply 
})

for (const webSocketClient of [true, false]) {
    for (const webSocketServer of [true, false]) { 

        describe(`websocket ${webSocketClient ? 'enabled' : 'disabled'} on client, ${webSocketServer ? 'enabled' : 'disabled'} on server`, () => {
            const server = calculator.asServer({ webSocket: webSocketServer })
            const client = calculator.asClient({ webSocket: webSocketClient })
            // 
  
            beforeAll(() => server.start())
            beforeAll(() => client.start())
            
            afterAll(() => client.stop())
            afterAll(() => server.stop())

            //// Tests //// 
        
            for (const [{ name, ...data }, output] of [

                [ { name: 'add', a: 10, b: 10 }, { result: 20 } ],
                [ { name: 'divide', a: 10, b: 10 }, { result: 1 } ],
                [ { name: 'subtract', a: 10, b: 10 }, { result: 0 } ],
                [ { name: 'multiply', a: 10, b: 10 }, { result: 100 } ]

            ] as const) { 

                it(`calculator ${name} test ${JSON.stringify(data)} should result in ${JSON.stringify(output)}`, async () => {
                    const result = await client.commands[name](data)
                    expect(result).toEqual(output)
                })
            }

            it('typesafe add', async () => {
                const result = await client.commands.add({ a: 10, b: 10 })
                expect(result).toHaveProperty('result', 20)
            })

            it('typesafe multiply', async () => {
                const result = await client.commands.multiply({ a: 100, b: 0.25 })
                expect(result).toHaveProperty('result', 25)
            })

            it('typesafe divide', async () => {
                const result = await client.commands.divide({ a: 50, b: 50 })
                expect(result).toHaveProperty('result', 1)
            })

            it('typesafe subtract', async () => {
                const result = await client.commands.subtract({ a: 50, b: 50 })
                expect(result).toHaveProperty('result', 0)
            })
        })

    }
}