import { Match } from '@benzed/ecs'

import Client, { ClientOptions } from './client'
import { Command, CommandResult } from '../../command'

import { fetch } from 'cross-fetch'
import { AppModules } from '../../app-module'

/*** UrlCommand ***/

interface UrlCommand extends Command, Pick<ClientOptions, 'host'> { }

const urlCommandToRequest = Match
    .create((c: UrlCommand) => c.name === `connect`, c => ({ url: `${c.host}`, method: `options` as const }))
    .add((c: UrlCommand) => !!c, c => ({ url: `${c.host}/${c.name}`, method: `get` as const }))
    .compute

/*** FetchSocketIOClient ***/

export class FetchSocketIOClient extends Client {

    static withOptions(options: ClientOptions): new (m: AppModules) => FetchSocketIOClient {
        return class extends FetchSocketIOClient {
            constructor (
                components: AppModules,
            ) {
                super(components, options)
            }
        }
    }

    async compute(command: Command): Promise<CommandResult> {

        const { host, constant } = this.options

        if (command.name === `connect` && constant)
            await this._startSocketIO()

        const { url, method } = urlCommandToRequest({ ...command, host })

        const req = await fetch(url, { method })

        console.log(await req.text())

        return { name: command.name }
    }

    async start(): Promise<void> {
        await super.start()
        if (this.options.constant)
            await this._stopSocketIO()
        else 
            await this.compute({ name: `connect` })
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

}
