import { Server } from './server'

import { inputToOutput } from '@benzed/util'

/*** Test ***/

let startErr: unknown
let stopErr: unknown
beforeAll(async () => {
    const server = Server.create()
    startErr = await server.start().catch(inputToOutput)
    stopErr = await server.stop().catch(inputToOutput)
})

it(`.start()`, () => {
    expect(startErr).toBe(undefined)
})

it(`.stop()`, () => {
    expect(stopErr).toBe(undefined)
})

it(`.type === "server"`, () => {
    const server = Server.create()
    expect(server.type).toBe(`server`)
})