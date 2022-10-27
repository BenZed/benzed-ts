import { Server } from './server'
import fetch, { FetchError } from 'node-fetch'

import { io } from '@benzed/util'

it(`creates a server that listens for connections`, async () => {

    const server = new Server()
    await server.start()

    const res = await fetch(`http://localhost:${server.options.port}/`).catch(io)
    expect(res).not.toBeInstanceOf(FetchError)

    await server.stop()

})