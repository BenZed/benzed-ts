import { Modules } from '@benzed/ecs'
import { callable, nil } from '@benzed/util'

import { AppModule } from '../../app-module'
import { Command } from '../command'

/**
 * Base class for creating connections either to or from the server.
 */
export abstract class Connection<O extends object> extends AppModule<O> {

    //// Module Implementation ////

    override validate(): void {
        Modules.assert.isRootLevel(this)
        Modules.assert.isSingle(this)
    }

    getCommands(): Command<string, object, object> [] {
        return this.root.find.all.inDescendents((m): m is Command<string,object,object> => callable.isInstance(m, Command))
    }

    getCommand(name: string): Command<string, object, object> | nil {
        return this.getCommands()?.find(c => c.name === name)
    }

}

export default Connection