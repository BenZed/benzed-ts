
import Client from './client'
import type { Command } from '../../command'

import { fetch } from 'cross-fetch'

/*** FetchSocketIOClient ***/

/**
 * Client that connects to a server using fetch or socket.io
 */
export class FetchSocketIOClient extends Client {
 
    // Command Module Implementation
    executeOnServer(command: Command): Promise<object> {

        const { constant } = this.settings

        return constant 
            ? this._sendSocketIOCommand(command)
            : this._sendFetchCommand(command)

    }

    // Module Implementation
    override async start(): Promise<void> {
        await super.start()
        if (this.settings.constant)
            await this._startSocketIO()
        else 
            /**
             * There's no maintaining a connection when using rest,
             * so instead we just get a command list to ensure that it is
             * still there.
             */
            await this.getCommandList()
    }

    override async stop(): Promise<void> {
        await super.stop()
        if (this.settings.constant)
            await this._stopSocketIO()
    }

    // Helper 
    
    private async _startSocketIO(): Promise<void> {
        await Promise.resolve()
    }

    private async _stopSocketIO(): Promise<void> {
        await Promise.resolve()
    }

    private _sendSocketIOCommand(command: Command): Promise<object> {
        return Promise.resolve({})
    }

    private async _sendFetchCommand(command: Command): Promise<object> {
        const { host } = this.settings

        const req = await fetch(host, { method: `post`, body: JSON.stringify(command) })
        return req.json()
    }

    async getCommandList(): Promise<Command['name'][]> {

        const { host } = this.settings

        const res = await fetch(host, { method: `options` })

        const commandList = await res.json()
        // TODO validate command list
        
        return commandList
    }
}
