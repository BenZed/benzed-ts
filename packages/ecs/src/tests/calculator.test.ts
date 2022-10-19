import $, { Schema } from '@benzed/schema'
import { TypeGuard } from '@benzed/util'
import { Component } from '../component'
import { Node, TransferNode } from '../node'
import System from '../system'

type Operation = '*' | '-' | '+' | '/'

interface Calculation <O extends Operation = Operation> { 
    readonly operation: O 
    readonly values: readonly [ number, number ]
}

const $operation = $.enum('*', '-', '+', '/')
const isOperation: TypeGuard<Operation> = $operation.is

const { is: isCalculation } = $.shape({

    operation: $operation,
    values: $.tuple($.number, $.number)

})

const input = Node.create(
    new CalculatorInput(),

)

const calculator = System.create('input', Node.create(new CalculatorInput(), { isInput: isCalculation }))

it('is a system')