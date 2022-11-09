import { Component } from './component'

import { System } from './system'
import { Empty } from '@benzed/util/lib'

class Test extends Component {

    constructor(
        parent: Component,
        readonly count: number
    ) {
        super(parent)
    }

}

it(`is sealed`, () => {
    // @ts-expect-error Sealed
    void class extends System<Empty> {}
})

it(`allows creation of nodes`, () => {

    const Node = System.create()

    const NodeTest = Node.extend({ Test })

    const node = NodeTest.create().useTest(10)
})