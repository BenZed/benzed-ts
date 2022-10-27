
import Client, { ClientOptions } from './client'
import { Command, CommandResult } from '../../command'

export class FetchSocketIOClient extends Client {

    constructor(
        options?: ClientOptions
    ) {
        super(options)
    }

    command(command: Command): Promise<CommandResult> {
        return Promise.resolve(command)
    }

    async start(): Promise<void> {
        await super.start()
        if (this.options.constant)
            await this._startSocketIO()
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
