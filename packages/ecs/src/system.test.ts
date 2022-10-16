import { System } from './system'
import { Node } from './node'
import Entity from './entity'

it('create()', () => {

    type Double = Entity<number, number>
    const double: Double = { execute: i => i * 2 }

    const x2 = Node.create(
        double,
        r => r.at(0) ?? null
    )

    const log = Node.create(
        { execute: (i: string) => parseInt(i) },
        r => r.at(0) ?? null
    )

    const system = System.create('input', x2)
        .link(['input'], 'x2', x2)
        .link(['x2'], 'log', log)

    expect(system.nodes).toHaveProperty('input')

})