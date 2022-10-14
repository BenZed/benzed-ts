import { Compile } from '@benzed/util/lib'
import { Node, Component, EntityOutput, Entity } from './ecs'

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
    const operate = new Operate()

    const operator = Node.create('input', operate)

    type OperatorOutput = EntityOutput<typeof operate>

})

it('nodes are comprised of entities; components or other nodes', () => {
    
    const calculator = Node
        .create('input', new Operate())
        .add(['input'], '+', new Add())
        .add(['input'], '*', new Multiply())
        .add(['input'], '/', new Divide())
        .add(['input'], '-', new Subtract())
        .add(['+', '*', '/', '-'], '>>', new Log())
        .add(['input'], 'error', new Error())

    type CalcSys = (typeof calculator) extends Node<infer S, infer I> ? [S,I] : unknown

    type CalcOutput = EntityOutput<typeof calculator>
 
})