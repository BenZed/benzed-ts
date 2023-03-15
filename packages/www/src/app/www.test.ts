import { client, server } from './www'

import { test, beforeAll, afterAll } from '@jest/globals'

//// Tests ////

beforeAll(async () => {
    await server.start()
    await client.start()
})

afterAll(async () => {
    await client.stop()
    await server.stop()
})

test(`${client.name}`, async () => {

    console.log(await client.serveUI()) 

}) 
