
import { is, IsType } from '@benzed/is'
import { pick } from '@benzed/util'

import Module from '../../module'
import { Connection } from '../connection'
import { DEFAULT_SERVER_PORT } from '../../util/constants'

//// Types ////

interface ClientSettings {

    /**
     * Server address for the client to connect to.
     */
    readonly host: string

}

const isClientSettings: IsType<ClientSettings> = is.shape({
    host: is.string.default(() => `http://localhost:${DEFAULT_SERVER_PORT}`)
})

//// Main ////

/**
 * This client module provides functionality for:
 * - Connecting to the server
 * - Sending commands to the server, retreiving their results
 * - Subscribing to state updates for modules on the server to their local counterparts
 *   client side
 */
class Client extends Connection implements ClientSettings {

    readonly host: string

    constructor(
        settings: Partial<ClientSettings> = {}
    ) {
        super()
        this.host = isClientSettings.validate(settings).host
    }

    get [Module.state](): ClientSettings {
        return pick(this, 'host')
    }

    onStart(): void | Promise<void> {
        //
    }

    onStop(): void | Promise<void> {
        //
    }
}

//// Exports ////

export default Client

export {
    Client,
    ClientSettings,
    isClientSettings
}