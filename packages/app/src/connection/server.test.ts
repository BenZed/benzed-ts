import { Server, DEFAULT_SERVER_SETTINGS } from './server'
import fetch from 'cross-fetch'

import { io } from '@benzed/util'

/*** Test ***/

it.skip(`creates a server that listens for commands`, async () => {

    const server = new Server(DEFAULT_SERVER_SETTINGS)
    await server.start()

    const res = await fetch(`http://localhost:${server.settings.port}/`, { method: `options` }).catch(io)
    expect(res).not.toHaveProperty(`code`, `ECONNREFUSED`)

    await server.stop()

    const json = await res.json()
    expect(json).toHaveProperty(`name`)
    expect(json).toHaveProperty(`version`)
})
