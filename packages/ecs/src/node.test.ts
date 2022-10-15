import { Node } from './node'
import Component from './component'

import { expectTypeOf } from 'expect-type'
import Entity, { OutputOf } from './entity'

/*** Components ***/

type Operator = '+' | '*' | '/' | '-'

class Operate extends Component<
/**/ { value: [number, number], operation: Operator }, 
/**/ [number, number],
/**/ Operation
> {

    public execute(
        input: { 
            value: [number, number]
            operation: Operator 
        }, 
        refs: Operation[]
    ): { 
            output: [number, number]
            next: Operation | null 
        } {

        const output = input.value

        const next = refs.find(ref => ref.operator === input.operation) ?? null
        
        return {
            output,
            next
        }
    }
}

abstract class Operation extends Component<[number, number], number> {

    protected abstract _operate(a: number, b: number): number 

    public readonly abstract operator: Operator

    public execute(
        input: [number, number], 
        refs: Entity<number>[]
    ): {
            output: number
            next: Entity<number> | null 
        } {

        const output = this._operate(...input)

        const Target = Number.isNaN(output) ? ErrorHandler : Log 

        const next = refs.find(ref => ref instanceof Target) ?? refs.at(0) ?? null

        return {
            output,
            next
        }        
    }
}

class Add extends Operation {

    public readonly operator = '+'

    protected _operate(a: number, b: number): number {
        return a + b
    }
}

class Multiply extends Operation {

    public readonly operator = '*'

    protected _operate(a: number, b: number): number {
        return a * b
    }
}

class Divide extends Operation {

    public readonly operator = '/'

    protected _operate(a: number, b: number): number {
        return a / b
    }
}

class Subtract extends Operation {

    public readonly operator = '-'

    protected _operate(a: number, b: number): number {
        return a - b
    }
}

class NotOperation extends Component<[number,number], string, Component<string>> {
    
    public execute(
        input: [number, number], 
        refs: Component<string>[]
    ): {
            output: string 
            next: Component<string> | null 
        } {
            
        return {
            output: `${input}`,
            next: refs[0]
        }
    }

}

class Log extends Component<number, string> {

    public execute(
        input: number, 
        refs: Entity<string>[]
    ): { 
            output: string
            next: Entity<string> | null 
        } {

        return {
            output: `${input}`,
            next: refs.at(0) ?? null
        }
        
    }

}

class ErrorHandler extends Component<number, Error> {

    public execute(
        input: number, 
        refs: Entity<Error>[]
    ): { 
            output: Error
            next: Entity<Error> | null 
        } {

        return {
            output: new Error(`${input} is not a number.`),
            next: refs.at(0) ?? null
        }
        
    }

}

/*** Tests ***/

it('Node.create to create nodes', () => {
    const operator = Node.create('input', new Operate())
    expect(operator).toBeInstanceOf(Node)
})

it('nodes can be comprised of components', () => {
    
    const calculator = Node
        .create('input', new Operate())
        .link(['input'], '+', new Add())
        .link(['input'], '*', new Multiply())
        .link(['input'], '/', new Divide())
        .link(['input'], '-', new Subtract())
        .link(['+', '*', '/', '-'], '>>', new Log())
        .link(['+', '*', '/', '-'], 'error', new ErrorHandler())

    type CalculatorOutput = OutputOf<typeof calculator>

    expectTypeOf<CalculatorOutput>().toEqualTypeOf<string | Error>()
 
})

it('nodes can be comprised of other nodes', () => {

    const arithmetic = Node.create('input', new Operate())
        .link(['input'], '+', new Add())
        .link(['input'], '*', new Multiply())
        .link(['input'], '/', new Divide())
        .link(['input'], '-', new Subtract())

    const calculator = Node.create('arithmetic', arithmetic)
        .link(['arithmetic'], 'error', new ErrorHandler())
        .link(['arithmetic'], '>>', new Log())

    type CalculatorOutput = OutputOf<typeof calculator>

    expectTypeOf<CalculatorOutput>().toEqualTypeOf<string | Error>()
})

it('nodes can only link components where output matches input', () => {

    Node.create('+', new Add())
    // @ts-expect-error invalid component input type
        .link(['+'], 'operate', new Operate())

})

it('nodes can only link components that match the ref type', () => {
    Node.create('input', new Operate())
        .link(['input'], '+', new Add())
    // @ts-expect-error invalid component ref type
        .link(['input'], '+', new NotOperation())
})

it('executes', () => {

    const arithmetic = Node.create('input', new Operate())
        .link(['input'], '+', new Add())
        .link(['input'], '*', new Multiply())
        .link(['input'], '/', new Divide())
        .link(['input'], '-', new Subtract())

    const calculator = Node.create('arithmetic', arithmetic)
        .link(['arithmetic'], 'error', new ErrorHandler())
        .link(['arithmetic'], '>>', new Log())

    const calc = (a: number, b: number, operation: Operator): string | Error => 
        calculator.execute( 
            {
                value: [a,b],
                operation
            }, []
        ).output

    expect(calc(10,10,'*')).toEqual('100')
    expect(calc(10,10,'+')).toEqual('20')
    expect(calc(10,10,'/')).toEqual('1')
    expect(calc(10,10,'-')).toEqual('0')
})