import { Node } from './node'
import { System } from './system'
import { OutputOf } from './component'

import { expectTypeOf } from 'expect-type'

import { random } from '@benzed/array'
import { $ } from '@benzed/schema'

/*** Eslint ***/

/* eslint-disable @typescript-eslint/no-explicit-any */

/*** Setup  ***/

const x2 = Node.create(
    $.number.is,
    i => i * 2
)

const log = Node.create(
    $.number.is,
    i => `${i}`,
)

const system = System
    .create('x2', x2)
    .link(['x2'], 'log', log)

/*** Tests ***/

it('output of a system follows exection it\'s linked nodes', () => {

    const output = system.compute(1)

    expect(output).toEqual('2')
})

it('system output is computed from the output type of it\'s nodes', () => {

    type SysO = OutputOf<typeof system>

    expectTypeOf<SysO>().toEqualTypeOf<string>()

    const error = Node.create(() => new Error('Do not use this route'))

    const system2 = system.link(
        ['x2'], 
        'error', 
        error
    )

    type SystemUnionOutput = OutputOf<typeof system2>
    expectTypeOf<SystemUnionOutput>().toEqualTypeOf<string | Error>()
})

it('can only link to nodes with input matching output', () => {

    // @ts-expect-error boolean !== string
    system.link(['log'], 'bad', Node.create((i: boolean) => !i, $.boolean.is))

})

it('systems can be nested in systems', () => {

    const randomizer = Node.create(
        $.array(
            $.or(
                $.number, 
                $.boolean
            )
        ).mutable.is,
        (arr: (number | boolean)[]) => random(arr),
    )

    const parent = System
        .create('input', randomizer)
        .link(['input'], 'invert', Node.create(
            $.boolean.is,
            i => !i
        ))
        .link(['input'], 'x2log', system)

    type ParentOutput = OutputOf<typeof parent>

    expectTypeOf<ParentOutput>().toEqualTypeOf<string | boolean>()
})

it('system can handle short circuting', () => {

    // if a node has a union output type, it's linked nodes
    // do not need to handle all types of the union, only one of them.
    // so, if a node has an output type that is not handled by any of it's outputs
    // it short circuits and returns instead of throwing a flow control error

    // eslint-disable-next-line
    const randomizer = (arr: (boolean | number)[]) => random(arr)

    const s1 = System
        .create('rand', Node.create(
            $.array(
                $.or(
                    $.boolean,
                    $.number
                )
            ).mutable.is,
            // ^ is.mutable.array.of.boolean.or.number < TODO this syntax
            randomizer,
        
        ))
        .link(['rand'], 'num', Node.create(
            $.number.is,
            i => i
        ))

    type S1Output = OutputOf<typeof s1>
    expectTypeOf<S1Output>().toEqualTypeOf<number | boolean>()

})