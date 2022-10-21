import { math, Operation, MathComponent } from '../components'
import { Node } from './node'
import { Transfer } from './_node'

import is from '@benzed/is'
import { Compute } from '../component'

type MathTransfer<O extends Operation, B extends number> = 
    Transfer<number,number, MathComponent<O, B>>

class MathNode<O extends Operation, B extends number> 
    extends Node<number, number, MathComponent<Operation, B>> {

    constructor(
        readonly by: number,
        readonly operation: Operation
    ) {
        super() 

        this.compute = math[this.operation](this.by).compute
    }
    
    canCompute = is.number

    compute: Compute<number, number>

    transfer: MathTransfer<O, B> = ctx => 
        ctx.targets.find(t => t.operation === this.operation) ?? null

}

it.todo('target')