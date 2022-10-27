import { Server } from './server'
import fetch from 'cross-fetch'

import { io } from '@benzed/util'

/*** Test ***/

it(`creates a server that listens for connections`, async () => {

    const server = new Server()
    await server.start()

    const res = await fetch(`http://localhost:${server.options.port}/`).catch(io)
    expect(res).not.toHaveProperty(`code`, `ECONNREFUSED`)

    await server.stop()

})