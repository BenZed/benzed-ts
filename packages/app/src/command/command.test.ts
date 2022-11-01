import { command, Command, CommandsOf } from './command'

import { expectTypeOf } from 'expect-type'

import { $, SchemaFor } from '@benzed/schema'
import is from '@benzed/is'

import { HttpMethod } from '../modules/connection/server/http-methods'

/* eslint-disable 
    @typescript-eslint/no-explicit-any
*/

//// Setup ////

class Foo {

    bar = false

    setBar = command((data: { bar: boolean }) => {
        this.bar = data.bar
        return Promise.resolve({
            success: this.bar === data.bar
        })
    })

    getPizza = command((data: { slices: `${number}` }) => {

        const slices = Math.max(parseInt(data.slices), 2)

        return Promise.resolve({
            slices,
            cost: slices * 2.5
        })

    }).validator(
        $({
            slices: $.string
                .asserts(s => is.number(parseInt(s)), 'must be a numeric string')
                .asserts(s => parseInt(s) > 0, 'must be above 0')
        
        }) as SchemaFor<{slices: `${number}`}>
    ).req(HttpMethod.Get, '/slices', 'slices')

}

const foo = new Foo()

type FooCommands = CommandsOf<Foo>

//// Test ////

it('command() creates commands', async () => {

    const output = await foo.setBar({ bar: true })

    expect(output).toEqual({ success: true })
    expect(foo.bar).toBe(true)
})

it('.validator() sets a validator for a command', () => {

    expect(() => foo.getPizza({ slices: '-1' })).toThrow('must be above 0')

})

it('.req() sets request handling for a command', () => {

    expect(
        foo.getPizza.toReq?.({ slices: '5' })
    ).toEqual(
        [HttpMethod.Get, '/slices/5', {}]
    )
    
    expect(
        foo.getPizza.fromReq?.([ HttpMethod.Get, '/slices/2', { } ])
    ).toEqual(
        { slices: '2' }
    )

})

it('CommandsOf<> finds commands on objects', () => {

    expectTypeOf<FooCommands>().toEqualTypeOf<{

        setBar: Command<{ bar: boolean }, Promise<{ success: boolean }>, void>

        getPizza: Command<{ slices: `${number}` }, Promise<{ slices: number, cost: number }>, 'slices'>

    }>()

})

