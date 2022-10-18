import { System } from './system'
import { Node } from './node'
import { Component } from './component'

it('is comprised of nodes', () => {

    const x2 = Node.create({ execute: (i: number) => i * 2 } as Component<number>)
    const log = Node.create((i: number) => `${i}`)

    const system1 = System.create('x2', x2)
    const system2 = system1.link(['x2'], 'log', log)

    const output = system2.execute({
        targets: [],
        input: 1
    })

    expect(output).toEqual({
        target: null,
        output: '2'
    })

})