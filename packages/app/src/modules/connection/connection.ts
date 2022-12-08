
import { SettingsModule } from '../../module'

/**
 * Base class for creating connections either to or from the server.
 */
export abstract class Connection<O extends object> extends SettingsModule<O> {

    /**
     * Execute a command with the given name and data
     */
    abstract execute(name: string, data: object): Promise<object>

    //// Module Implementation ////

    override _validateModules(): void {
        this._assertSingle()
        this._assertRoot()
    }

}

export default Connection