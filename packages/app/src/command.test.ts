
import { App, AppCommandInterface, AppCommands } from './app'

import { CommandModule } from './module'
import { Command } from './command/types'

import { expectTypeOf } from 'expect-type'

/*** Types ***/

interface FooCommand extends Command {
    name: 'get-foo'
    foo: 'baz' | 'bar'
}

class FooModule extends CommandModule<FooCommand>{

    protected _execute(command: FooCommand): object | Promise<object> {
        return command
    }

    canExecute(command: Command): command is FooCommand {
        return command.name === `get-foo`
    }
}

/*** Tests ***/

const fooApp = App.create().use(new FooModule({}))

it(`App command definitions are gathered from it\'s modules`, () => {

    type FooCommands = AppCommands<typeof fooApp>
    expectTypeOf<FooCommands>().toEqualTypeOf<FooCommand>()

    fooApp.execute({
        name: `get-foo`,
        foo: `baz`
    })

})

it(`commands are type-safe`, () => {
    
    // @ts-expect-error Not a command
    expect(() => fooApp.execute({ name: `not-a-command` }))
        .toThrow(`${App.name} cannot execute command`)
})

it(`command interface convience ui`, () => {

    type FooCommandUI = AppCommandInterface<typeof fooApp>

    expectTypeOf<keyof FooCommandUI>().toEqualTypeOf<'getFoo'>()
})