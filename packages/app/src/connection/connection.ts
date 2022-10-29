
import { Empty } from '@benzed/util'
import { Command } from '../command'

import { Module } from '../module'

export const DEFAULT_PORT = 3000

export const WEBSOCKET_PATH = `/ws/`

/**
 * Base class for creating connections either to or from the server.
 */
export abstract class Connection<O extends object = Empty> extends Module<O> {

    override validateModules(): void {
        this._assertSingle()
        this._assertRoot()
    }

    abstract readonly type: `server` | `client` | null

    private _started = false
    get active(): boolean {
        return this._started
    }

    override start(): void | Promise<void> {
        if (this._started) {
            throw new Error(
                `${this.type} has already been started`
            )
        }
        this._started = true
    }

    override stop(): void | Promise<void> {
        if (!this._started) {
            throw new Error(
                `${this.type} has not been started`
            )
        }
        this._started = false
    }

    /**
     * Retreive a list of all commands possible.
     */
    abstract getCommandList(): Promise<Command['name'][]>

}

export default Connection