import { Renderer } from '@benzed/renderer'

import { feathers, Application } from '@feathersjs/feathers'
import feathersSocketio from '@feathersjs/socketio-client'

import socketio from 'socket.io-client'

import type { FileServices } from '../index'

/*** Types ***/

type ClientRenderer = Application<FileServices, { renderer: Renderer | null }>

/*** Helper ***/

function createFeathersClient(host: string): ClientRenderer {

    return feathers()
        .configure(
            feathersSocketio(
                socketio(host)
            )
        )
        .set('renderer', null) // so not initially undefined
}

function setupHandlers(client: ClientRenderer): void {

    /**
     * TODO:
     * - register as renderer on server, tell server how many maxConcurrent renders can be handled
     * - create renderer out of render settings received from server
     * - on socketio.render request:
     *      - download/stream file
     *      - convert file
     *      - upload converted file back to server
     */
    void client
}

/*** Main ***/

function createClientRenderer(host: string): ClientRenderer {

    const client = createFeathersClient(host)

    setupHandlers(client)

    return client
}

/*** Exports ***/

export default createClientRenderer

export {
    createClientRenderer,
    ClientRenderer
}

