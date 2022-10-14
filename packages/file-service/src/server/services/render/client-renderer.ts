
import { feathers, Application } from '@feathersjs/feathers'
import fsocketio from '@feathersjs/socketio-client'
import fauth from '@feathersjs/authentication-client'
import type { AuthenticationRequest, AuthenticationResult } from '@feathersjs/authentication'

import { Renderer } from '@benzed/renderer'

import socketio, { Socket } from 'socket.io-client'
import { FileService } from '../files/service'
import { RenderService } from './service'

/*** Types ***/

interface ClientRenderer extends 
    Application<
    { 
        'files': FileService 
        'files/render': RenderService 
    }, 
    { 
        renderer: Renderer | null 
    }> {

    io: Socket 

    authenticate(req: AuthenticationRequest): Promise<AuthenticationResult>

}

interface ClientRendererSettings {
    host: string
    auth?: AuthenticationRequest
}

interface ClientUploadOptions { 
    /**/ 
}

/*** Helper ***/

async function clientUpload(options: ClientUploadOptions): Promise<void> {
    //
}

function createFeathersClient(host: string, auth?: AuthenticationRequest): ClientRenderer {

    const app = feathers()
        .configure(
            fsocketio(
                socketio(host)
            )
        )
        .set('renderer', null) as ClientRenderer

    if (auth) {
        app.configure(
            fauth({
                storageKey: 'benzed-client-renderer'
            })
        )
    }
    
    return app
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

function untilConnect(client: ClientRenderer): Promise<void> {
    return new Promise(resolve => 
        client.io.on(
            'connect', 
            resolve
        )
    )
}

/*** Main ***/

async function createClientRenderer(config: ClientRendererSettings): Promise<ClientRenderer> {

    const { host, auth } = config

    const client = createFeathersClient(host, auth)

    setupHandlers(client)

    await untilConnect(client)

    if (auth) 
        await client.authenticate(auth)

    return client
}

/*** Exports ***/

export default createClientRenderer

export {
    createClientRenderer,
    ClientRenderer,

    clientUpload
}

