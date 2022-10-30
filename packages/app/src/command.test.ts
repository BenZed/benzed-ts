
import { App, AppCommandInterface, AppCommands } from './app'

import { CommandModule } from './module'
import { Command } from './command'

import { expectTypeOf } from 'expect-type'
import $ from '@benzed/schema'

/*** Types ***/

const $bazBar = $(`baz`, `bar`)

const foo = Command
    .create(`get-foo`, (data: { foo: 'bar' | 'baz'}) => ({ sup: `${data.foo}!` }))
    .data(
        $({
            foo: $bazBar
        }).validate
    )

const bar = Command
    .create(`get-bar`)
    .data(
        $({
            bar: $.boolean
        }).validate
    )

type FooCommand = typeof foo

type BarCommand = typeof bar

class FooModule extends CommandModule<FooCommand | BarCommand>{

    commands = [foo]

}

/*** Tests ***/

const fooModule = new FooModule({})

fooModule.execute(`get-bar`, { bar: true })
fooModule.execute(`get-foo`, { foo: `baz` })

const fooApp = App.create().use(fooModule)

it(`App command definitions are gathered from it\'s modules`, () => {

    type FooCommands = AppCommands<typeof fooApp>
    expectTypeOf<FooCommands>().toEqualTypeOf<FooCommand>()

    fooApp.execute(`get-foo`)

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