import $, { Infer } from '@benzed/schema'
import { Command } from '../../command'

import Connection from '../connection'
import { DEFAULT_SERVER_SETTINGS } from '../server'

/*** Types ***/

interface ClientSettings extends Infer<typeof $clientOptions> {}
const $clientOptions = $({
    constant: $.boolean.default(false),
    host: $.string
})

/*** Constants ***/

const DEFAULT_CLIENT_SETTINGS: ClientSettings = { 
    constant: false,
    host: `http://localhost:${DEFAULT_SERVER_SETTINGS.port}` 
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

    DEFAULT_CLIENT_SETTINGS

}