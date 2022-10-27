import { Match } from '@benzed/ecs'

import Client, { ClientOptions } from './client'
import type { Command, CommandResult } from '../../command'

import { fetch } from 'cross-fetch'
import type { Modules } from '../../modules'

/*** UrlCommand ***/

interface UrlCommand extends Command, Pick<ClientOptions, 'host'> { }

const urlCommandToRequest = Match
    .create((c: UrlCommand) => !!c, c => ({ url: `${c.host}/${c.name}`, method: `get` as const }))
    .compute

/*** FetchSocketIOClient ***/

export class FetchSocketIOClient extends Client {

    static withOptions(options: ClientOptions): new (m: Modules) => FetchSocketIOClient {
        return class extends FetchSocketIOClient {
            constructor (
                components: Modules,
            ) {
                super(components, options)
            }
        }
    }

    async compute(command: Command): Promise<CommandResult> {

        const { host } = this.options

        const { url, method } = urlCommandToRequest({ ...command, host })

        const req = await fetch(url, { method })
        return req.json()
    }

    async start(): Promise<void> {
        await super.start()
        if (this.options.constant)
            await this._startSocketIO()
        else 
            await this._fetchOptions()
    }

    async stop(): Promise<void> {
        await super.stop()
        if (this.options.constant)
            await this._stopSocketIO()
    }

    private async _startSocketIO(): Promise<void> {
        await Promise.resolve()
    }

    private async _stopSocketIO(): Promise<void> {
        await Promise.resolve()
    }

    private async _fetchOptions(): Promise<void> {

        const { host } = this.options

        const res = await fetch(host, { method: `options` })

        const json = await res.json()
        if (!json.version || ! json.name)
            throw new Error(`${host} gave invalid response.`)
    }
}
