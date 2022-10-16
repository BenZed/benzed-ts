import { System } from './system'

import { expectTypeOf } from 'expect-type'
import Component, { OutputOf } from './component/component'

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
        refs: Component<number>[]
    ): {
            output: number
            next: Component<number> | null 
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
        refs: Component<string>[]
    ): { 
            output: string
            next: Component<string> | null 
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
        refs: Component<Error>[]
    ): { 
            output: Error
            next: Component<Error> | null 
        } {

        return {
            output: new Error(`${input} is not a number.`),
            next: refs.at(0) ?? null
        }
    }
}

/*** Tests ***/

it('System.create to create nodes', () => {
    const operator = System.create('input', new Operate())
    expect(operator).toBeInstanceOf(System)
})

it('systems can be comprised of nodes of components', () => {
    
    const calculator = System
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

it('Systems can be comprised of other systems', () => {

    const arithmetic = System.create('input', new Operate())
        .link(['input'], '+', new Add())
        .link(['input'], '*', new Multiply())
        .link(['input'], '/', new Divide())
        .link(['input'], '-', new Subtract())

    const calculator = System.create('arithmetic', arithmetic)
        .link(['arithmetic'], 'error', new ErrorHandler())
        .link(['arithmetic'], '>>', new Log())

    type CalculatorOutput = OutputOf<typeof calculator>

    expectTypeOf<CalculatorOutput>().toEqualTypeOf<string | Error>()
})

it('systems can only link nodes where output matches input', () => {

    System.create('+', new Add())
    // @ts-expect-error invalid component input type
        .link(['+'], 'operate', new Operate())

})

it('systems can only link nodes that match the ref type', () => {
    System.create('input', new Operate())
        .link(['input'], '+', new Add())
    // @ts-expect-error invalid component ref type
        .link(['input'], '+', new NotOperation())
})

it('system flow control', () => {

    const arithmetic = System.create('input', new Operate())
        .link(['input'], '+', new Add())
        .link(['input'], '*', new Multiply())
        .link(['input'], '/', new Divide())
        .link(['input'], '-', new Subtract())

    const calculator = System.create('arithmetic', arithmetic)
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

it('nodes must return a transfer ref if given links', () => {

    class BrokenAdd extends Add {

        public override execute(
            input: [number, number], 
            refs: Component<number>[]
        ): { 
                output: number
                next: Component<number> | null 
            } {
            
            const {output} = super.execute(input, refs)
            return {
                next: null,
                output
            }
        }
    }

    const brokenCalculator = System.create('input', new Operate())
        .link(['input'], '+', new BrokenAdd())
        .link(['+'], '>>', new Log())

    expect(() => brokenCalculator.execute({ operation: '+', value: [10, 10]}, []))
        .toThrow('Premature transfer flow termination')

})