import Connection from '../connection'

import $, { Infer } from '@benzed/schema'

/*** Types ***/

interface ServerSettings extends Infer<typeof $serverOptions> {}
const $serverOptions = $({
    port: $.integer.range({ 
        min: 1025, 
        comparator: `...`, 
        max: 65536
    })
})

/*** Constants ***/

const DEFAULT_SERVER_SETTINGS: ServerSettings = { port: 3000 }

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
    DEFAULT_SERVER_SETTINGS
}