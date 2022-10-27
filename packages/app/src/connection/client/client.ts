import $, { Infer } from '@benzed/schema'

import { DEFAULT_SERVER_OPTIONS } from '../server'
import Connection from '../connection'

/*** Types ***/

interface ClientOptions extends Infer<typeof $clientOptions> {}
const $clientOptions = $({
    constant: $.boolean.default(false),
    host: $.string
})

/*** Constants ***/

const DEFAULT_CLIENT_OPTIONS: ClientOptions = { 
    constant: true,
    host: `http://localhost:${DEFAULT_SERVER_OPTIONS.port}` 
}

/*** Client ***/

/**
 * Creates connection to server, allows commands to be emitted.
 */
abstract class Client extends Connection {

    readonly type = `client` as const

    constructor(
        readonly options: ClientOptions = DEFAULT_CLIENT_OPTIONS
    ) {
        super()
    }

}

/*** Exports ***/

export default Client

export {
    Client,
    ClientOptions
}