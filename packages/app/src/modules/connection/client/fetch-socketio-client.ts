
import { fetch } from 'cross-fetch'
import { io, Socket } from 'socket.io-client'

import Client, { $clientSettings, ClientSettings } from './client'

import { stringify as toQueryString } from 'query-string'

import { HttpMethod } from '../../../util'
import { WEBSOCKET_PATH } from '../../../constants'
import { through } from '@benzed/util'

//// Eslint ////

/* eslint-disable 
    @typescript-eslint/no-explicit-any
*/

//// FetchSocketIoClient ////

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

    // Module Implementation

    override async start(): Promise<void> {
        await super.start()
        if (this.settings.webSocket)
            await this._startSocketIO()
    }

    override async stop(): Promise<void> {
        await super.stop()
        if (this.settings.webSocket)
            await this._stopSocketIO()
    }

    // Connection Implementation 

    execute(name: string, data: object): Promise<object> {
        return this._io?.connected
            ? this._executeSocketIOCommand(name, data)
            : this._executeFetchCommand(name, data)
    }

    // Helper 
    
    private async _startSocketIO(): Promise<void> {
        
        const { host, webSocket } = this.settings
            
        if (!this._io && webSocket) {
            this._io = io(host, { 
                path: WEBSOCKET_PATH, 
                autoConnect: false, 
                forceNew: true
            })
        }

        const _io = this._io
        if (!_io)
            return

        await new Promise<void>((resolve, reject) => {
            _io.once('connect', resolve)
            _io.once('connect_error', reject)
            _io.connect()
        }).catch(through)

        this.log`connected to server ${ host }`
    }

    private async _stopSocketIO(): Promise<void> {
        const io = this._io
        if (!io?.connected)
            return 

        await new Promise<void>((resolve) => {
            io.once('disconnect', () => resolve())
            io.disconnect()
        })

        this.log`disconnected from server`
    }

    private _executeSocketIOCommand(rootName: string, data: object): Promise<object> {
        const io = this._io as Socket 

        return new Promise<object>((resolve, reject) => {
            io.emit('command', rootName, data, (err: null, result: object) => {
                if (err)
                    reject(err)
                else 
                    resolve(result)
            })
        })
    }

    private async _executeFetchCommand(rootName: string, cmdData: object): Promise<object> {
        const { host } = this.settings

        const command = this.root.getCommand(rootName)

        const { method, url: cmdEndPoint, body, headers } = command.request.to(cmdData)
        const { query, ...reqData } = (body ?? {}) as { query?: object }

        const fetchData = {
            method,
            body: method === HttpMethod.Get ? null : JSON.stringify(reqData),
            headers: headers ?? undefined
        }

        const fetchEndPoint = query ? `${cmdEndPoint}${toQueryString(query)}` : cmdEndPoint

        const response = await fetch(`${host}${fetchEndPoint}`, fetchData)
        return response.json()
    }

}
