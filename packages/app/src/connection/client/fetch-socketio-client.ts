
import Client, { DEFAULT_CLIENT_SETTINGS } from './client'
import type { Command, CommandResult } from '../../command'

import { fetch } from 'cross-fetch'

/*** UrlCommand ***/

// interface UrlCommand extends Command, Pick<ClientOptions, 'host'> { }

/*** FetchSocketIOClient ***/

const { host, constant } = DEFAULT_CLIENT_SETTINGS

/**
 * Client that connects to a server using fetch or socket.io
 */
export class FetchSocketIOClient extends Client {

    async execute(_command: Command): Promise<CommandResult> {

        const { url, method } = { url: host, method: `options` }

        const req = await fetch(url, { method })
        return req.json()
    }

    async start(): Promise<void> {
        await super.start()
        if (constant)
            await this._startSocketIO()
        else 
            await this._fetchOptions()
    }

    async stop(): Promise<void> {
        await super.stop()
        if (constant)
            await this._stopSocketIO()
    }

    private async _startSocketIO(): Promise<void> {
        await Promise.resolve()
    }

    private async _stopSocketIO(): Promise<void> {
        await Promise.resolve()
    }

    private async _fetchOptions(): Promise<void> {

        const res = await fetch(host, { method: `options` })

        const json = await res.json()
        if (!json.version || !json.name)
            throw new Error(`${host} gave invalid response.`)
    }
}
