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
abstract class Client extends Connection<Command, ClientSettings> {

    /**
     * A client is essentially a routing component. It
     * should be able to execute any command.
     */
    override canExecute(command: Command): command is Command {
        return true
    }

    readonly type = `client` as const

}

/*** Exports ***/

export default Client

export {
    Client,
    ClientSettings,

    DEFAULT_CLIENT_SETTINGS

}