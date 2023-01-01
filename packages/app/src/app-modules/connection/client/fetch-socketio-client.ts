
import { fetch } from 'cross-fetch'
import { io, Socket } from 'socket.io-client'

import { capitalize, toCamelCase } from '@benzed/string'
import { InputOf, nil, OutputOf, through } from '@benzed/util'

import Client, { $clientSettings, ClientSettings } from './client'

import { $path, HttpCode, WEBSOCKET_PATH } from '../../../util'
import { Command, CommandError } from '../..'

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

    _io: Socket | nil = nil

    // Module Implementation

    override async start(): Promise<void> {
        await super.start()
        if (this.data.webSocket)
            await this._startSocketIO()
    }

    override async stop(): Promise<void> {
        await super.stop()
        if (this.data.webSocket)
            await this._stopSocketIO()
    }

    // Connection Implementation 

    _execute<C extends Command>(
        command: C,
        data: InputOf<C>
    ): OutputOf<C> {
        return (
            this._io?.connected
                ? this._executeSocketIOCommand(command, data)
                : this._executeFetchCommand(command, data)
        ) as OutputOf<C>
    }

    // Helper 
    
    private async _startSocketIO(): Promise<void> {
        
        const { host, webSocket } = this.data
            
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

    private _executeSocketIOCommand(command: Command, data: object): Promise<object> {
        const io = this._io as Socket 

        const rootName = this._getCommandRootName(command)

        return new Promise<object>((resolve, reject) => {
            io.emit('command', rootName, data, (err: null, result: object) => {
                if (err)
                    reject(CommandError.from(err))
                else 
                    resolve(result)
            })
        })
    }

    private async _executeFetchCommand(command: Command, cmdData: object): Promise<object> {
        const { host } = this.data

        const { method, url, body, headers } = command.toRequest(cmdData)

        const response = await fetch(
            host + $path.validate(`${command.node.getPathFromRoot()}${url}`), 
            { 
                method,
                body: body && JSON.stringify(body), 
                headers 
            }
        )

        if (response.status >= HttpCode.BadRequest) {
            const text = await response.text()
            let error
            try {
                error = JSON.parse(text)
            } catch {
                error = {
                    code: HttpCode.InternalServerError,
                    message: response.statusText
                }
            }
            throw CommandError.from(error)
        }

        return response.json()
    }
    
    private _getCommandRootName(command: Command): string {

        const path = command.node.getPathFromRoot()

        return path.length > 1
            ? toCamelCase(path, '/') + capitalize(command.name)
            : command.name
    }

}
