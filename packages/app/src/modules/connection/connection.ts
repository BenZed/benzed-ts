
import { SettingsModule } from '../../app-module'

/**
 * Base class for creating connections either to or from the server.
 */
export abstract class Connection<O extends object> extends SettingsModule<O> {

    //// Module Implementation ////

    override _validateModules(): void {
        this._assertSingle()
        this._assertRoot()
    }

}

export default Connection