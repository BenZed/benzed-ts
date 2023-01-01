
import $, { Infer } from '@benzed/schema'

import Connection from '../connection'
import { $clientSettings } from '../client'
import { $port } from '../../../util/schemas'
import { DEFAULT_SERVER_PORT } from '../../../util'

//// Types ////

interface ServerSettings extends Infer<typeof $serverSettings> {}
const $serverSettings = $({
    port: $port.optional.default(DEFAULT_SERVER_PORT),

    webSocket: $clientSettings.$.webSocket,
})

//// Server ////

/**
 * Serverside connections, sends commands sent to users to the app
 */
abstract class Server extends Connection<Required<ServerSettings>> {

    static readonly icon = '🖥️'

}

//// Exports ////

export default Server

export {
    Server,
    ServerSettings,
    $serverSettings

}