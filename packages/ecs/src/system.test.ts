import { System } from './system'
import { Node } from './node'
import { Component, OutputOf } from './component'

import { expectTypeOf } from 'expect-type'
import { random } from '@benzed/array/lib'

/*** Setup  ***/

const x2 = Node.create({ execute: (i: number) => i * 2 } as Component<number>)
const log = Node.create((i: number) => `${i}`)

const system = System.create('x2', x2)
    .link(['x2'], 'log', log)

/*** Tests ***/

it('output of a system follows exection it\'s linked nodes', () => {

    const output = system.execute({
        targets: [],
        input: 1
    })

    expect(output).toEqual({
        target: null,
        output: '2'
    })
})

it('system output is computed from the output type of it\'s nodes', () => {

    type SystemOutput = OutputOf<typeof system>
    expectTypeOf<SystemOutput['output']>()
        .toEqualTypeOf<string>()

    const system2 = system.link(
        ['x2'], 
        'error', 
        Node.create(() => new Error('Do not use this route'))
    )

    type SystemUnionOutput = OutputOf<typeof system2>
    expectTypeOf<SystemUnionOutput['output']>()
        .toEqualTypeOf<string | Error>()
})

it('can only link to nodes with input matching output', () => {

    // @ts-expect-error boolean !== string
    system.link(['log'], 'bad', Node.create((i: boolean) => !i))

})

it('systems can be nested in systems', () => {

    const randomizer = Node.create(
        (arr: [number | string | boolean]) => random(arr)
    )

    const parent = System
        .create('input', randomizer)
        .link(['input'], 'invert', Node.create((i: boolean) => !i))
        .link(['input'], 'x2log', system)
        .link(['input'], 'x2log', Node.create((i:number) => `${i}`))

    type ParentOutput = OutputOf<typeof parent>['output']

    expectTypeOf<ParentOutput>().toEqualTypeOf<string | boolean>()
})