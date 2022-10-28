
import { App, AppCommands } from './app'
import { ToServerCommand } from './connection/server/koa-server'

import { expectTypeOf } from 'expect-type'
import { CommandModule } from './modules'
import { Command } from './command/types'

interface FooCommand extends Command {
    name: 'get-foo'
    foo: 'baz' | 'bar'
}

class FooModule extends CommandModule<FooCommand>{

    protected _execute(command: FooCommand): object | Promise<object> {
        return command
    }

    canExecute(command: Command): command is FooCommand {
        return !!command
    }
}

it(`command definitions from added components are added to the app as types`, () => {

    const app = App.create().server().use(new FooModule({}))

    type ACommands = AppCommands<typeof app>
    
    expectTypeOf<ACommands>().toEqualTypeOf<ToServerCommand | FooCommand>()
})