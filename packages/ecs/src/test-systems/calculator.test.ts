import $ from '@benzed/schema'
import { Compute } from '../component'
import { math, Operation, } from '../components'

import { transfers, Node, Transfer, } from '../node'
import System from '../system'

/*** Types ***/

const $operation = $.enum('*', '-', '+', '/')

interface Calc <O extends Operation = Operation> { 
    readonly operation: O 
    readonly values: readonly [ number, number ]
}
const $calc = $.shape({
    operation: $operation,
    values: $.tuple($.number, $.number)
})

/*** Nodes ***/

class CalcOperate<O extends Operation> extends Node<Calc['values'], number> {

    constructor(
        public operation: O
    ) {
        super()
    }

    compute: Compute<Calc['values'], number> = ([value, by]) => 
        math[this.operation](by).compute(value)

    canCompute = $calc.$.values.is

    transfer = transfers.switcher<number>()

}

class CalcInput extends Node<Calc, Calc['values'], CalcOperate<Operation>> {

    compute: Compute<Calc, Calc['values']> = i => i.values

    canCompute= $calc.is

    transfer: Transfer<Calc, Calc['values'], CalcOperate<Operation>> = 
        ctx => ctx.targets.find(t => t.operation === ctx.input.operation) ?? null

}

class Max extends Node<number[], number> {

    compute = (i: number[]): number => Math.max(...i)

    canCompute = $.array($.number).mutable.is

    transfer = transfers.switcher<number>()

}

/*** System ***/

const calculator = System.create('input', new CalcInput())
    .link(['input'], '*', new CalcOperate('*'))
    .link(['input'], '+', new CalcOperate('+'))
    .link(['input'], '-', new CalcOperate('-'))
    .link(['input'], '/', new CalcOperate('/'))

/*** Tests ***/
    
it('discriminant target test', () => {
    const max = new Max()
    
    // @ts-expect-error Should only be able to link to CalcOperate nodes 
    calculator.link(['input'], 'log', max)
})

it('output test', () => {

    const output = calculator.compute({
        values: [5,5],
        operation: '*'
    })

    expect(output).toBe(25)
    
})