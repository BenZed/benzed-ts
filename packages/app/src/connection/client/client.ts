import $, { Infer } from '@benzed/schema'

import Connection from '../connection'

/*** Types ***/

interface ClientOptions extends Infer<typeof $clientOptions> {}
const $clientOptions = $({
    constant: $.boolean.default(false),
    host: $.string
})

/*** Constants ***/

const DEFAULT_CLIENT_OPTIONS: ClientOptions = { 
    constant: false,
    host: `http://localhost:${3000}` 
}

/*** Client ***/

/**
 * Creates connection to server, allows commands to be emitted.
 */
abstract class Client extends Connection<ClientOptions> {

    readonly type = `client` as const

}

/*** Exports ***/

export default Client

export {
    Client,
    ClientOptions,

    DEFAULT_CLIENT_OPTIONS

}