
import { Finder } from './find'
import Module from './module'
import { Node } from './node'
import Path from './node/path'

it('creates a convenience interface for finding modules', () => {

    const node = Node.create(
        Module.for('aunt' as const),
        Node.create(
            Path.create('/current-generation'),
            Module.for('brother' as const),
            Module.for('hero' as const),
            Module.for('sister' as const),
            Node.create(
                Path.create('/next-generation'),
                Module.for('neice' as const),
                Module.for('nephew' as const)
            )
        ),
        Module.for('uncle' as const)
    )

    const hero = node
        .get('/current-generation')
        .get(2)

    const find = new Finder(hero)

    const neice = find.require.inDescendents(Module.for('neice' as const)) 
    expect(neice.state).toEqual('neice')

    expect(neice.parent.find(Path)) 
})