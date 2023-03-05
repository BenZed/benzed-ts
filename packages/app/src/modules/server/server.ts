
import { is, IsType } from '@benzed/is'
import { nil, pick } from '@benzed/util'

import { createServer, Server as HttpServer } from 'http'
import Koa, { Context } from 'koa'
import body from 'koa-body'
import cors from '@koa/cors'

import { Module } from '../../module'
import { isPort } from '../../util/schemas'
import { Connection } from '../connection'

//// Types ////

interface ServerSettings {

    /**
     * Port to open.
     */
    readonly port: number

}

const isServerSettings: IsType<ServerSettings> = is.shape({

    port: isPort.readonly

})

//// Main ////

/**
 * This client module provides functionality for:
 * - Connecting to the server
 * - Sending commands to the server, retreiving their results
 * - Subscribing to state updates for modules on the server to their 
 *   local counterparts client side
 */
class Server extends Connection implements ServerSettings {

    constructor(
        settings: Partial<ServerSettings> = {}
    ) {
        super()
        this.port = isServerSettings
            .validate(settings)
            .port
    }

    //// State ////

    readonly port: number

    get [Module.state](): ServerSettings {
        return pick(this, 'port')
    }

    // TODO Modules should not be copyable while app is running

    //// Trait Implementations ////

    _onStart(): void | Promise<void> { 
        /**/
    }

    _onStop(): void | Promise<void> { 
        /**/
    }

    //// Runtime State ////

    private readonly _http: HttpServer | nil = nil
}

//// Exports ////

export default Server

export {
    Server,
    ServerSettings,
    isServerSettings
}