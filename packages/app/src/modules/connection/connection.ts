
import { Command } from '../../command'

import { Module, ModuleSetting } from '../../module'

export const DEFAULT_PORT = 3000

export const WEBSOCKET_PATH = `/ws/`

/**
 * Base class for creating connections either to or from the server.
 */
export abstract class Connection<O extends ModuleSetting = ModuleSetting> extends Module<O> {

    override validateModules(): void {
        this._assertSingle()
        this._assertRoot()
    }

    abstract readonly type: `server` | `client` | null

    readonly active: boolean = false

    override start(): void | Promise<void> {
        if (this.active) {
            throw new Error(
                `${this.type} has already been started`
            )
        }

        // why am I casting to object with a mutable active property?
        // I'm getting a very strange bug where the App class is intended
        // to extend the most of the Connection interface, but it kept 
        // telling me I was missing the _active despite it being private
        // and Omit<>ing it
        (this as { active: boolean }).active = true
    }

    override stop(): void | Promise<void> {
        if (!this.active) {
            throw new Error(
                `${this.type} has not been started`
            )
        }
        (this as { active: boolean }).active = false
    }

    /**
     * Retreive a list of all commands possible.
     */
    abstract getCommandList(): Promise<Command['name'][]>

}

export default Connection