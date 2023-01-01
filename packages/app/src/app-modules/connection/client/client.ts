import $, { Infer } from '@benzed/schema'
import { InputOf, OutputOf } from '@benzed/util'

import Connection from '../connection'
import { DEFAULT_SERVER_PORT } from '../../../util'
import { Command } from '../../command'

//// Types ////

interface ClientSettings extends Infer<typeof $clientSettings> {}
const $clientSettings = $({

    webSocket: $.boolean
        .optional
        .default(false),

    host: $.string
        .optional
        .default(`http://localhost:${DEFAULT_SERVER_PORT}`)

})

//// Client ////

/**
 * Creates connection to server, allows commands to be emitted.
 */
abstract class Client extends Connection<Required<ClientSettings>> {

    static readonly icon = '📱'

    /**
     * @internal
     * Execute a command with the given name and data
     */
    abstract _execute<C extends Command>(
        command: C,
        data: InputOf<C>
    ): OutputOf<C>
        
}

//// Exports ////

export default Client

export {
    Client,
    ClientSettings,
    $clientSettings

}