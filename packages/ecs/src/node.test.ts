import { Node } from './node'
import { Component } from './component'

/*** Types ***/

class ToString extends Component<number, string> {
    public execute(input: number): string {
        return `${input}`
    }
}

class ToNumber extends Component<string, number> {
    public execute(_input: string): number {
        return parseInt(_input)
    }
}

const n1 = Node.create(new ToString())

/*** Test ***/

it('immutably adds components', () => {

    const n2 = n1.push(new ToNumber())
    expect(n2).not.toBe(n1)

})

