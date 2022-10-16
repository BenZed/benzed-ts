import { Node } from './node'

it('create nodes with node.create', () => {

    Node.create(
        (i: number) => i * 2, 
        r => r.at(0) ?? null
    )

})