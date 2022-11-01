import $, { Infer } from '@benzed/schema'

import { DEFAULT_SERVER_PORT } from '../../../constants'
import { $logIcon } from '../../../schemas'

import Connection from '../connection'

/*** Types ***/

interface ClientSettings extends Infer<typeof $clientSettings> {}
const $clientSettings = $({
    logIcon: $logIcon   
        .default(`📱`),
    
    webSocket: $.boolean
        .optional
        .default(false),
    
    host: $.string
        .optional
        .default(`http://localhost:${DEFAULT_SERVER_PORT}`)
})

/*** Client ***/

/**
 * Creates connection to server, allows commands to be emitted.
 */
abstract class Client extends Connection<Required<ClientSettings>> {

    readonly type = `client` as const

}

/*** Exports ***/

export default Client

export {
    Client,
    ClientSettings,
    $clientSettings

}