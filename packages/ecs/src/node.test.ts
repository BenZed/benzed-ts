import { Node } from './node'
import { Component } from './component'

import { expectTypeOf } from 'expect-type'

/*** Types ***/

class Foo extends Component<'foo'> {
    protected readonly _name = 'foo'
}

class Bar extends Component<'bar'> {
    protected readonly _name = 'bar'
}

const node = new Node().addComponent(new Foo())

/*** Test ***/

it('immutably adds components', () => {

    const node2 = node.addComponent(new Bar())
    expect(node2).not.toBe(node)
})

it('typesafe get component', () => {

    const [foo] = node.getComponents('foo')

    expect(foo).toBeInstanceOf(Foo)
    expectTypeOf(foo).toMatchTypeOf<Foo>()
})
