import { Module } from '@benzed/ecs'
import { callable, nil } from '@benzed/util'

import { AppModule } from '../../app-module'
import { Command } from '../command'

/**
 * Base class for creating connections either to or from the server.
 */
export abstract class Connection<O extends object> extends AppModule<O> {

    //// Module Implementation ////

    override validate(): void {
        Module.assert.isRootLevel(this)
        Module.assert.isSingle(this)
    }

    getCommands(): Command<string, object, object> [] {
        const commands = this
            .node
            .root
            .findModule
            .inDescendents((m): m is Command<string,object,object> => callable.isInstance(m, Command))
        return commands
    }

    getCommand(name: string): Command<string, object, object> | nil {
        return this.getCommands()?.find(c => c.name === name)
    }

}

export default Connection