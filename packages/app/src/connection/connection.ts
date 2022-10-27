
import { Empty } from '@benzed/util/lib'
import { Command } from '../command'
import { CommandModule } from '../modules'

/**
 * Base class for creating connections either to or from the server.
 */
export abstract class Connection<C extends Command = Command, O extends object = Empty> extends CommandModule<C, O> {

    protected _validateComponents(): void {
        this._assertSingle()
        if (this.parent?.modules.at(0) !== this)
            throw new Error(`${this.constructor.name} must be the first module.`)
    }

    abstract readonly type: `server` | `client` | null

    private _started = false
    get active(): boolean {
        return this._started
    }

    start(): void | Promise<void> {
        if (this._started) {
            throw new Error(
                `${this.type} has already been started`
            )
        }
        this._started = true
    }

    stop(): void | Promise<void> {
        if (!this._started) {
            throw new Error(
                `${this.type} has not been started`
            )
        }
        this._started = false
    }

}

export default Connection