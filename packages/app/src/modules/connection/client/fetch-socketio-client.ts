
import type { Command } from '../../../command'
import Client, { $clientSettings, ClientSettings } from './client'

import { fetch } from 'cross-fetch'
import { io, Socket } from 'socket.io-client'
import { WEBSOCKET_PATH } from '../../../constants'

/*** FetchSocketIOClient ***/

/**
 * Client that connects to a server using fetch or socket.io
 */
export class FetchSocketIOClient extends Client {

    static create(settings: ClientSettings = {}): FetchSocketIOClient {

        return new FetchSocketIOClient(
            $clientSettings.validate(settings) as Required<ClientSettings>
        )
    }

    _io: Socket | null = null

    constructor(settings: Required<ClientSettings>) {
        super(settings)

        this._io = settings.webSocket 
            ? io(settings.host, { 
                path: WEBSOCKET_PATH, 
                autoConnect: false, 
                forceNew: true
            })
            : null

    }
 
    // Module Implementation

    override async start(): Promise<void> {
        await super.start()
        if (this.settings.webSocket)
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
        if (this.settings.webSocket)
            await this._stopSocketIO()
    }

    // Connection Implementation 

    executeOnServer(command: Command): Promise<object> {

        const { webSocket } = this.settings
        return webSocket 
            ? this._sendSocketIOCommand(command)
            : this._sendFetchCommand(command)
    }

    async getCommandList(): Promise<Command['name'][]> {

        const { host } = this.settings

        const res = await fetch(host, { method: `options` })

        // TODO validate command list
        const commandList = await res.json()

        this.log`fetched command list ${commandList}`

        return commandList
    }

    // Helper 
    
    private async _startSocketIO(): Promise<void> {
        
        const { host } = this.settings

        const io = this._io as Socket
        if (io.connected)
            return 

        await new Promise<void>((resolve, reject) => {
            io.once(`connect`, resolve)
            io.once(`connect_error`, reject)
            io.connect()
        })

        this.log`connected to server ${ host }`
    }

    private async _stopSocketIO(): Promise<void> {
        const io = this._io as Socket 
        if (!io.connected)
            return 

        await new Promise<void>((resolve) => {
            io.once(`disconnect`, () => resolve())
            io.disconnect()
        })

        this.log`disconnected from server`
    }

    private _sendSocketIOCommand(command: Command): Promise<object> {
        const io = this._io as Socket 

        return new Promise<object>((resolve, reject) => {
            io.emit(`command`, command, (err: null, result: object) => {
                if (err)
                    reject(err)
                else 
                    resolve(result)
            })
        })
    }

    private async _sendFetchCommand(command: Command): Promise<object> {
        const { host } = this.settings

        const req = await fetch(host, { method: `post`, body: JSON.stringify(command) })
        return req.json()
    }

}
