import { System } from './system'
import { OutputOf } from './component'

import { expectTypeOf } from 'expect-type'
import { Node } from './node'

import { random } from '@benzed/array'
import { $ } from '@benzed/schema'

/*** Eslint ***/

/* eslint-disable @typescript-eslint/no-explicit-any */

/*** Setup  ***/

const x2 = Node.create({ 
    execute: (i: number) => i * 2,
    isInput: $.number.is
})

const log = Node.create({
    execute: (i: number) => `${i}`,
    isInput: $.number.is
})

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

    type Sys = typeof system

    type SystemOutput = OutputOf<Sys>['output']

    expectTypeOf<SystemOutput>().toEqualTypeOf<string>()

    const system2 = system.link(
        ['x2'], 
        'error', 
        Node.create({
            execute: (_: any) => new Error('Do not use this route'),
            isInput: $.unknown.is
        })
    )

    type SystemUnionOutput = OutputOf<typeof system2>['output']
    expectTypeOf<SystemUnionOutput>().toEqualTypeOf<string | Error>()
})

it('can only link to nodes with input matching output', () => {

    // @ts-expect-error boolean !== string
    system.link(['log'], 'bad', TransferNode.create((i: boolean) => !i))

})

it('systems can be nested in systems', () => {

    const randomizer = Node.create({
        execute: (arr: (number | boolean)[]) => random(arr),
        isInput: $.array(
            $.or(
                $.number, 
                $.boolean
            )
        ).mutable.is
    })

    const parent = System
        .create('input', randomizer)
        .link(['input'], 'invert', Node.create({
            execute: (i: boolean) => !i,
            isInput: $.boolean.is
        }))
        .link(['input'], 'x2log', system)

    type ParentOutput = OutputOf<typeof parent>['output']

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
        .create('rand', Node.create({
            execute: randomizer,
            isInput: $.array($.or($.boolean, $.number)).mutable.is 
            // ^ is.mutable.array.of.boolean.or.number < TODO this syntax
        }))
        .link(['rand'], 'num', Node.create({
            execute: (i: number) => i,
            isInput: $.number.is
        }))

    type S1Output = OutputOf<typeof s1>['output']
    expectTypeOf<S1Output>().toEqualTypeOf<number | boolean>()

})