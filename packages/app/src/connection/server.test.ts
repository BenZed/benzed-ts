import { Server, DEFAULT_SERVER_OPTIONS } from './server'
import fetch from 'cross-fetch'

import { io } from '@benzed/util'

/*** Test ***/

it(`creates a server that listens for commands`, async () => {

    const server = new Server([], DEFAULT_SERVER_OPTIONS, i => i)
    await server.start()

    const res = await fetch(`http://localhost:${server.options.port}/`).catch(io)
    expect(res).not.toHaveProperty(`code`, `ECONNREFUSED`)

    await server.stop()

})