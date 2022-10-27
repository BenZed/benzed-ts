import { Command, CommandResult } from "../command"

/**
 * Base class for creating connections either to or from the server.
 */
export abstract class Connection {

    abstract readonly type: `server` | `client` | null

    private _started = false

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

    abstract command(command: Command): Promise<CommandResult>

}

export default Connection