import $ from '@benzed/schema'
import { math, Operation } from '../components'

import { transfer, TransferContext, Node, _Node } from '../node'
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

class CalcOperate<O extends Operation> extends _Node<Calc['values'], number> {

    public constructor(
        public operation: O
    ) {
        super()
    }

    protected _execute = ([value, by]: Calc['values']): number => 
        math[this.operation](by).execute(value)

    protected _is = $calc.$.values.is

    protected _transfer = transfer.switcher()

}

class CalcInput extends _Node<Calc, Calc['values'], CalcOperate<Operation>> {

    protected _execute = (i: Calc): Calc['values'] => i.values

    protected _is = $calc.is

    protected _transfer = 
        (
            ctx: TransferContext<Calc, Calc['values'], CalcOperate<Operation>>
        ): CalcOperate<Operation> | null => 
            ctx.targets.find(t => t.operation === ctx.input.operation) ?? null

}

/*** System ***/

const calculator = System.create('input', new CalcInput())
    .link(['input'], '*', new CalcOperate('*'))
    .link(['input'], '+', new CalcOperate('-'))
    .link(['input'], '/', new CalcOperate('/'))
    .link(['input'], '-', new CalcOperate('-'))

/*** Tests ***/
    