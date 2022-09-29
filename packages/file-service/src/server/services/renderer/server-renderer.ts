import {
    AddRenderItemOptions,
    Renderer,
    RendererConfig,
    RenderTask
} from '@benzed/renderer'
import { resolve } from 'path'
import { Socket } from 'socket.io-client'

import { Writable } from 'stream'

/*** Types ***/

interface NetworkRendererConfig extends RendererConfig {
    socket: Socket
}

/*** Main ***/

/**
 * Doesn't actually do any rendering, acts as an agent representing a client
 * renderer.
 */
class ServerRenderer extends Renderer {

    private readonly _socket: Socket

    public constructor (config: NetworkRendererConfig) {
        const { socket, ...rest } = config

        super(rest)

        this._socket = socket
    }

    protected _createRenderTask(
        addOptions: AddRenderItemOptions,
        renderSetting: RendererConfig['settings'][string],
        output: string | Writable
    ): RenderTask {
        /**
         * TODO
         * - receive render request
         * - send signed download urls/upload urls to client socket
         */
    }
}

/*** Exports ***/

export default ServerRenderer

export {
    ServerRenderer,
    NetworkRendererConfig
}