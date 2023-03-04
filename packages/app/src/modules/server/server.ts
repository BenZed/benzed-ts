
import { is, IsType } from '@benzed/is'
import { pick } from '@benzed/util'

import { Module } from '../../module'
import { Connection } from '../connection'
import { DEFAULT_SERVER_PORT } from '../../util/constants'

//// Types ////

interface ServerSettings {

    /**
     * Port to open
     */
    readonly port?: number

}

// TODO move me
const isPort = is
    .number
    .named('Port')
    .default(() => DEFAULT_SERVER_PORT)
    //.range(1025, '...', 65536)

const isServerSettings: IsType<ServerSettings> = is.shape({
    port: isPort.optional
})

//// Main ////

/**
 * This client module provides functionality for:
 * - Connecting to the server
 * - Sending commands to the server, retreiving their results
 * - Subscribing to state updates for modules on the server to their local counterparts
 *   client side
 */
class Server extends Connection implements ServerSettings {

    readonly port?: number

    constructor(
        settings: Partial<ServerSettings> = {}
    ) {
        super()
        this.port = isServerSettings
            .validate(settings)
            .port
    }

    get [Module.state](): ServerSettings {
        return pick(this, 'port')
    }

    onStart(): void | Promise<void> { /**/ }

    onStop(): void | Promise<void> { /**/ }
}

//// Exports ////

export default Server

export {
    Server,
    ServerSettings,
    isServerSettings
}