
import { Empty } from '@benzed/util/lib'
import { Command } from '../command'
import { CommandModule } from '../modules'

/**
 * Base class for creating connections either to or from the server.
 */
export abstract class Connection<C extends Command = Command, O extends object = Empty> extends CommandModule<C, O> {

    override validateModules(): void {
        this._assertSingle()
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

}

export default Connection