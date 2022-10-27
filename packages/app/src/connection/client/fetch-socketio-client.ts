
import Client from './client'
import type { Command, CommandResult } from '../../command'

import { fetch } from 'cross-fetch'

/*** FetchSocketIOClient ***/

/**
 * Client that connects to a server using fetch or socket.io
 */
export class FetchSocketIOClient extends Client {
 
    // Command Module Implementation
    async _execute(_command: Command): Promise<CommandResult> {

        const { host } = this.settings

        const { url, method } = { url: host, method: `options` }

        const req = await fetch(url, { method })
        return req.json()
    }

    // Module Implementation
    override async start(): Promise<void> {
        await super.start()
        if (this.settings.constant)
            await this._startSocketIO()
        else 
            await this._fetchOptions()
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

    /**
     * There's no maintaining a connection when using rest,
     * so instead we just 
     */
    private async _fetchOptions(): Promise<object> {

        const { host } = this.settings

        const res = await fetch(host, { method: `options` })

        const json = await res.json()
        return json
    }
}
