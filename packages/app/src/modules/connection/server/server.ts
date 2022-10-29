
import $, { Infer } from '@benzed/schema'

import Connection from '../connection'
import { $clientSettings } from '../client'
import { $logIcon, $port } from '../../../schemas'
import { DEFAULT_SERVER_PORT } from '../../../constants'

/*** Types ***/

interface ServerSettings extends Infer<typeof $serverSettings> {}
const $serverSettings = $({
    port: $port.optional.default(DEFAULT_SERVER_PORT),

    webSocket: $clientSettings.$.webSocket,
    logIcon: $logIcon.default(`🖥️`)
})

/*** Server ***/

/**
 * Serverside connections, sends commands sent to users to the app
 */
abstract class Server extends Connection<Required<ServerSettings>> {

    readonly type = `server` as const

}

/*** Exports ***/

export default Server

export {
    Server,
    ServerSettings,
    $serverSettings

}