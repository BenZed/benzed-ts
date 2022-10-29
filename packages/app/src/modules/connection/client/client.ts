import $, { Infer } from '@benzed/schema'
import { Command } from '../../../command'

import Connection, { DEFAULT_PORT } from '../connection'

/*** Types ***/

interface ClientSettings extends Infer<typeof $clientSettings> {}
const $clientSettings = $({
    webSocket: $.boolean.default(false),
    host: $.string
})

/*** Constants ***/

const DEFAULT_CLIENT_SETTINGS: ClientSettings = { 
    webSocket: false,
    host: `http://localhost:${DEFAULT_PORT}` 
}

/*** Client ***/

/**
 * Creates connection to server, allows commands to be emitted.
 */
abstract class Client extends Connection<ClientSettings> {

    readonly type = `client` as const

    abstract executeOnServer(command: Command): Promise<object>

}

/*** Exports ***/

export default Client

export {
    Client,
    ClientSettings,
    $clientSettings,

    DEFAULT_CLIENT_SETTINGS

}