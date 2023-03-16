
import { pick } from '@benzed/util'
import { is, IsType } from '@benzed/is'

import Module from '../../module'
import { Connection } from '../connection'
import { DEFAULT_SERVER_PORT } from '../../util/constants'

import { Command, CommandInput, CommandOutput } from '../command'

//// Types ////

interface ClientSettings {

    /**
     * Server address for the client to connect to.
     */
    readonly host: string

}

const isClientSettings: IsType<ClientSettings> = is.shape({
    host: is.string.default(() => `http://localhost:${DEFAULT_SERVER_PORT}`)
})

//// Main ////

/**
 * This client module provides functionality for:
 * - Connecting to the server
 * - Sending commands to the server, retreiving their results
 * - Subscribing to state updates for modules on the server to their local counterparts
 *   client side
 */
class Client extends Connection implements ClientSettings {

    readonly host: string

    constructor(
        settings: Partial<ClientSettings> = {} 
    ) {
        super()
        this.host = isClientSettings
            .validate(settings)
            .host
    }

    sendToServer<C extends Command>(
        command: C,
        input: CommandInput<C>
    ): Promise<CommandOutput<C>> { 

        const { path, pathFromRoot } = command

        console.log({ path, pathFromRoot })
        console.log(command.parent)
        console.log(command.pathFromRoot)
        return null as any
    }

    //// Runnable implementation ////
    protected _onStart(): void | Promise<void> {
        //
    }

    protected _onStop(): void | Promise<void> {
        //
    }

    //// Module Implementation ////
    get [Module.state](): ClientSettings {
        return pick(this, 'host')
    }
    
}

//// Exports ////

export default Client

export {
    Client,
    ClientSettings,
    isClientSettings
}