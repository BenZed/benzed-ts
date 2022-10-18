import { Component } from '../component'
import { LinearNode } from './linear-node'

it('simply wraps a node with a linear transfer method', () => {

    class Shout extends Component<string, `${string}!`> {

        public execute(input: string): `${string}!` {
            return `${input}!`
        }

    }

    const linearShout = new LinearNode(new Shout())

    const output = linearShout.execute({
        input: 'Hello?',
        targets: [new Shout()]
    })

    expect(output).toEqual({
        output: 'Hello?!',
        target: new Shout()
    })

})