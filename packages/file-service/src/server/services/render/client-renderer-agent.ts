import {
    RendererConfig,
    Renderer,
} from '@benzed/renderer'

import { Socket } from 'socket.io'

/*** Types ***/

interface ClientRendererAgentConfig extends RendererConfig {
    socket: Socket 
}

/*** Main ***/

/**
 * Doesn't actually do any rendering, acts as an agent representing a client
 * renderer.
 */
class ClientRendererAgent extends Renderer{

    public readonly socket: Socket 

    public constructor (config: ClientRendererAgentConfig) {
        const { socket, ...rest } = config

        super(rest)

        this.socket = socket
    }

    // protected _createRenderTask(
    //     addOptions: AddRenderItemOptions,
    //     renderSetting: RendererConfig['settings'][string],
    //     output: string | Writable
    // ): RenderTask {
    // }

    /**
     * TODO
     * - receive render request
     * - send signed download urls/upload urls to client socket
     */

}

/*** Exports ***/

export default ClientRendererAgent

export {
    ClientRendererAgent,
    ClientRendererAgentConfig
}