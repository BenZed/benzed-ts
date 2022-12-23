import { Modules } from '@benzed/ecs'
import { AppModule } from '../../app-module'

/**
 * Base class for creating connections either to or from the server.
 */
export abstract class Connection<O extends object> extends AppModule<O> {

    //// Module Implementation ////

    override validate(): void {
        Modules.assert.isRootLevel(this)
        Modules.assert.isSingle(this)
    }

}

export default Connection