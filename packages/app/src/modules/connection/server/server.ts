
import $, { Infer } from '@benzed/schema'

import Connection, { DEFAULT_PORT } from '../connection'
import { $clientSettings } from '../client'

/*** Types ***/

interface ServerSettings extends Infer<typeof $serverSettings> {}
const $serverSettings = $({
    port: $.integer.range({ 
        min: 1025, 
        comparator: `...`, 
        max: 65536
    }),

    webSocket: $clientSettings.$.webSocket,
    logIcon: $clientSettings.$.logIcon
})

/*** Constants ***/

const DEFAULT_SERVER_SETTINGS: ServerSettings = { 
    logIcon: `🖥️`, 
    port: DEFAULT_PORT, 
    webSocket: false 
}

/*** Server ***/

/**
 * Serverside connections, sends commands sent to users to the app
 */
abstract class Server extends Connection<ServerSettings> {

    readonly type = `server` as const

}

/*** Exports ***/

export default Server

export {
    Server,
    ServerSettings,
    $serverSettings,

    DEFAULT_SERVER_SETTINGS,

}