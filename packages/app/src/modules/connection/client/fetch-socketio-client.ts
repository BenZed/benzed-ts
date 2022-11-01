import is from '@benzed/is'

import { fetch } from 'cross-fetch'
import { io, Socket } from 'socket.io-client'

import { HttpMethod } from '../server'

import Client, { $clientSettings, ClientSettings } from './client'

import { WEBSOCKET_PATH } from '../../../constants'
import { createNameToReq } from '../../../command/request'

//// Eslint ////

/* eslint-disable 
    @typescript-eslint/no-explicit-any
*/

//// Helper ////

function toQueryString(data: object, prefix = ''): string {

    const queryStrings: string[] = []
 
    for (const key in data) {

        if (data.hasOwnProperty(key)) {

            const value = (data as any)[key]

            const keyWithPrefix = prefix ? `${prefix}[${key}]` : key

            const queryString = is.object(value)
                ? toQueryString(value, keyWithPrefix) 
                : encodeURIComponent(keyWithPrefix) + '=' + encodeURIComponent(value)

            queryStrings.push(queryString)
        }

    }

    const queryString = queryStrings.join('&')
    return queryString && !prefix ? `?${queryString}` : queryString
}

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
            // 
            await this._startSocketIO().catch(io)
    }

    override async stop(): Promise<void> {
        await super.stop()
        if (this.settings.webSocket)
            await this._stopSocketIO()
    }

    // Connection Implementation 

    execute(name: string, data: object): Promise<object> {

        const { webSocket } = this.settings
        return webSocket && this._io?.connected
            ? this._executeSocketIOCommand(name, data)
            : this._executeFetchCommand(name, data)
    }

    // Helper 
    
    private async _startSocketIO(): Promise<void> {
        
        const { host } = this.settings

        const io = this._io as Socket
        if (io.connected)
            return 

        await new Promise<void>((resolve, reject) => {
            io.once('connect', resolve)
            io.once('connect_error', reject)
            io.connect()
        })

        this.log`connected to server ${ host }`
    }

    private async _stopSocketIO(): Promise<void> {
        const io = this._io as Socket 
        if (!io.connected)
            return 

        await new Promise<void>((resolve) => {
            io.once('disconnect', () => resolve())
            io.disconnect()
        })

        this.log`disconnected from server`
    }

    private _executeSocketIOCommand(name: string, data: object): Promise<object> {
        const io = this._io as Socket 

        return new Promise<object>((resolve, reject) => {
            io.emit('command', name, data, (err: null, result: object) => {
                if (err)
                    reject(err)
                else 
                    resolve(result)
            })
        })
    }

    private async _executeFetchCommand(name: string, cmdData: object): Promise<object> {
        const { host } = this.settings

        const toReq = this.root.getCommand(name).toReq ?? createNameToReq(name)
        const [ method, url, reqData ] = toReq(cmdData)

        const fetchData = {
            method,
            body: method === HttpMethod.Get ? null : JSON.stringify(reqData),
            url: method === HttpMethod.Get ? `${url}${toQueryString(reqData)}` : url
        }

        const response = await fetch(host, fetchData)
        return response.json()
    }

}
