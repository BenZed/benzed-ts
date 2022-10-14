import { Node } from './node'
import Component from './component'

import { expectTypeOf } from 'expect-type'
import { OutputOf } from './entity'

/*** Components ***/

type Operation = '+' | '*' | '/' | '-'

class Operate extends Component<
{ value: number, operation: Operation }, 
{ value: number, operation: Operation }
> {

    public execute(
        input: { 
            value: number
            operation: Operation 
        } 
    ): { value: number, operation: Operation } {

        return input
    }
}

class Add extends Component<{ value: number, operation: '+' }, number> {

}

class Multiply extends Component<{ value: number, operation: '*' }, number> {

}

class Divide extends Component<{ value: number, operation: '/' }, number> {

}

class Subtract extends Component<{ value: number, operation: '-' }, number> {

}

class Log extends Component<number, string> {

}

class Error extends Component<{ value: number, operation: Operation }, Error> {

}

/*** Tests ***/

it('Node.create to create nodes', () => {
    const operator = Node.create('input', new Operate())
    expect(operator).toBeInstanceOf(Node)
})

it('nodes can be comprised of components', () => {
    
    const calculator = Node
        .create('input', new Operate())
        .add(['input'], '+', new Add())
        .add(['input'], '*', new Multiply())
        .add(['input'], '/', new Divide())
        .add(['input'], '-', new Subtract())
        .add(['+', '*', '/', '-'], '>>', new Log())
        .add(['input'], 'error', new Error())

    type CalculatorOutput = OutputOf<typeof calculator>

    expectTypeOf<CalculatorOutput>().toEqualTypeOf<string | Error>()
 
})

it('nodes can be comprised of other nodes', () => {

    const arithmetic = Node.create('input', new Operate())
        .add(['input'], '+', new Add())
        .add(['input'], '*', new Multiply())
        .add(['input'], '/', new Divide())
        .add(['input'], '-', new Subtract())

    const calculator = Node.create('operate', new Operate())
        .add(['operate'], 'arithmetic', arithmetic)
        .add(['operate'], 'error', new Error())
        .add(['arithmetic'], '>>', new Log())

    type CalculatorOutput = OutputOf<typeof calculator>

    expectTypeOf<CalculatorOutput>().toEqualTypeOf<string | Error>()

})

it('nodes can only add links with correct input', () => {

    Node.create('+', new Add())
        // @ts-expect-error Operate input type mismatch 
        .add(['+'], 'operate', new Operate())

})