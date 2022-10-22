import { $, Infer } from '@benzed/schema'
import { match } from '@benzed/match'
import { max, primes } from '@benzed/math'

import { Compute } from '../component'

import { transfers, Node, Transfer, } from '../node'
import System from '../system'

/*** Types ***/

const $operation = $.enum('*', '-', '+', '/', '**')

type Operation = Infer<typeof $operation>

interface Calc <O extends Operation = Operation> { 
    readonly operation: O 
    readonly values: readonly [ number, number ]
}
const $calc = $.shape({
    operation: $operation,
    values: $.tuple($.number, $.number)
})

/*** Nodes ***/

class Math<O extends Operation> extends Node<Calc['values'], number> {

    constructor(
        public operation: O
    ) {
        super()
    }

    compute: Compute<Calc['values'], number> = ([a, b]) => match(this.operation as Operation)
    /**/ ('*', () => a * b)
    /**/ ('/', () => a / b)
    /**/ ('+', () => a + b)
    /**/ ('-', () => a - b)
    /**/ ('**', () => a ** b).next()

    canCompute = $calc.$.values.is

    transfer = transfers.switcher<number>()

}

class Input extends Node<Calc, Calc['values'], Math<Operation>> {

    compute: Compute<Calc, Calc['values']> = i => i.values

    canCompute= $calc.is

    transfer: Transfer<Calc, Calc['values'], Math<Operation>> = 
        ctx => ctx.targets.find(t => t.operation === ctx.input.operation) ?? null

}

class Max extends Node<number[], number> {

    compute = (i: number[]): number => max(...i)

    canCompute = $.array($.number).mutable.is

    transfer = transfers.switcher<number>()

}

/*** System ***/

const calculator = System.create('input', new Input())
    .add(['input'], '*', new Math('*'))
    .add(['input'], '+', new Math('+'))
    .add(['input'], '-', new Math('-'))
    .add(['input'], '/', new Math('/'))

/*** Tests ***/
    
it('can discriminate target', () => {
    const max = new Max()
    
    // @ts-expect-error Should only be able to link to CalcOperate nodes 
    calculator.add(['input'], 'log', max)
})

for (const operation of $operation.$values) {

    for (const prime of primes(50)) {
        it('can output from * path', () => {

            const a = prime
            const b = prime

            const output = calculator.compute({
                values: [a,b],
                operation
            })
            expect(output).toBe(
                match(operation as Operation)
                ('*', a * b)    
                ('/', a / b)    
                ('-', a - b)    
                ('+', a + b)    
                ('**', a ** b).next()
            )
        })
    }
}
