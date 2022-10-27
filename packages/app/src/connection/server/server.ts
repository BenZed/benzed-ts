import Connection from '../connection'

import $, { Infer } from '@benzed/schema'

/*** Types ***/

interface ServerOptions extends Infer<typeof $serverOptions> {}
const $serverOptions = $({
    port: $.integer.range({ 
        min: 1025, 
        comparator: `...`, 
        max: 65536
    })
})

/*** Constants ***/

const DEFAULT_SERVER_OPTIONS: ServerOptions = { port: 3000 }

/*** Server ***/

/**
 * Serverside connections, sends commands sent to users to the app
 */
abstract class Server extends Connection {

    readonly type = `server` as const

    constructor(
        readonly options: ServerOptions = DEFAULT_SERVER_OPTIONS
    ) {
        super()
    }

}

/*** Exports ***/

export default Server

export {
    Server,
    ServerOptions,
    DEFAULT_SERVER_OPTIONS
}