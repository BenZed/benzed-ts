import { math, Operation, MathComponent } from '../components'
import { Node } from './node'
import { Transfer } from './_node'

import is from '@benzed/is'

type MathTransfer<O extends Operation, B extends number> = 
    Transfer<number,number, MathComponent<O, B>>

class MathNode<O extends Operation, B extends number> 
    extends Node<number, number, MathComponent<Operation, B>> {

    constructor(
        readonly by: number,
        readonly operation: Operation
    ) {
        super() 
    }
    
    canCompute = is.number

    compute = math[this.operation](this.by).compute

    transfer: MathTransfer<O, B> = ctx => 
        ctx.targets.find(t => t.operation === this.operation) ?? null

}

it.todo('target')