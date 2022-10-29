import { Server } from './server'
import fetch from 'cross-fetch'

import { inputToOutput, io } from '@benzed/util'

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

it(`.getCommandList()`, async () => {

    const server = Server.create()
    server.getCommandList = () => Promise.resolve([`command`, `list`, `here`])
    await server.start()

    const res = await fetch(
        `http://localhost:${server.settings.port}/`, 
        { method: `options` }
    ).catch(io)
    
    expect(res).not.toHaveProperty(`code`, `ECONNREFUSED`)

    await server.stop()

    const json = await res.json()
    expect(json).toEqual([`command`, `list`, `here`])
})

it(`.type === "server"`, () => {
    const server = Server.create()
    expect(server.type).toBe(`server`)
})