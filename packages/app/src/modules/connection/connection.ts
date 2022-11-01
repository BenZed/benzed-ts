
import { Command } from '../../command'
import { ModuleWithSettings } from '../../module'

/**
 * Base class for creating connections either to or from the server.
 */
export abstract class Connection<O extends object> extends ModuleWithSettings<O> {

    abstract readonly type: `server` | `client` | null

    /**
     * Execute a command with the given name and data
     */
    abstract execute(name: string, data: object): Promise<object>

    getCommand(name: string): Command {
        const commands = (this.parent?.commands ?? {}) as { [key: string]: Command | undefined } 
        const command = commands[name]
        if (!command)
            throw new Error(`Command ${name} could not be found.`)

        return command
    }

    //// Module Implementation ////

    override _validateModules(): void {
        this._assertSingle()
        this._assertRoot()
    }

}

export default Connection