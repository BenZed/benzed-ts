
import { fetch } from 'cross-fetch'
import { io, Socket } from 'socket.io-client'

import { InputOf, OutputOf, through } from '@benzed/util'
import { capitalize } from '@benzed/string'

import Client, { $clientSettings, ClientSettings } from './client'

import { WEBSOCKET_PATH } from '../../../util'
import { CommandModule } from '../../../modules'

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

    execute<C extends CommandModule<string, any, any>>(
        command: C,
        data: InputOf<C>
    ): Promise<OutputOf<C>> {
        return (
            this._io?.connected
                ? this._executeSocketIOCommand(command, data)
                : this._executeFetchCommand(command, data)
        ) as Promise<OutputOf<C>>
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

    private _executeSocketIOCommand(command: CommandModule<string, object, object>, data: object): Promise<object> {
        const io = this._io as Socket 

        const rootName = this._getCommandRootName(command)

        return new Promise<object>((resolve, reject) => {
            io.emit('command', rootName, data, (err: null, result: object) => {
                if (err)
                    reject(err)
                else 
                    resolve(result)
            })
        })
    }

    private async _executeFetchCommand(command: CommandModule<string, object, object>, cmdData: object): Promise<object> {
        const { host } = this.settings

        const { method, url, body, headers } = command
            .request
            .from(cmdData)

        const response = await fetch(
            `${host}${command.pathFromRoot}${url}`, 
            { 
                method,
                body: body && JSON.stringify(body), 
                headers 
            }
        )

        const text = await response.text()
        return JSON.parse(text)
    }
    
    private _getCommandRootName(command: CommandModule<string, object, object>): string {
        const path = command.pathFromRoot

        const rootName = path.length > 1
            ? path // "/deep/nested/service" => "deepNestedService${name}"
                .split('/')
                .filter(i => i)
                .concat(command.name)
                .map((n,i) => i === 0 ? n : capitalize(n))
                .join('')
        
            : command.name
        
        return rootName
    }

}
