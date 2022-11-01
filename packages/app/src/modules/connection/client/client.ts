import $, { Infer } from '@benzed/schema'

import Connection from '../connection'

import { $logIcon } from '../../../schemas'
import { DEFAULT_SERVER_PORT } from '../../../constants'

//// Types ////

interface ClientSettings extends Infer<typeof $clientSettings> {}
const $clientSettings = $({
    logIcon: $logIcon   
        .default('📱'),
    
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

}

//// Exports ////

export default Client

export {
    Client,
    ClientSettings,
    $clientSettings

}