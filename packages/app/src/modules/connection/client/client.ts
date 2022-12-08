import $, { Infer } from '@benzed/schema'
import { InputOf, OutputOf } from '@benzed/util'

import Connection from '../connection'

import { $logIcon } from '../../../schemas'
import { CommandModule } from '../../../modules'
import { DEFAULT_SERVER_PORT } from '../../../util'

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

    /**
     * Execute a command with the given name and data
     */
    abstract execute<C extends CommandModule<string, object, object>>(
        command: C,
        data: InputOf<C>
    ): Promise<OutputOf<C>>
        
}

//// Exports ////

export default Client

export {
    Client,
    ClientSettings,
    $clientSettings

}