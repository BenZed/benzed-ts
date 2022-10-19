import { Execute } from '../component'
import { math, Operation, MathComponent } from '../components'
import { Node, TransferContext } from './node'

import is from '@benzed/is'
import { TypeGuard } from '@benzed/util'
import transfer from './transfers'

class MathNode<O extends Operation, B extends number> 
    extends Node<number, number, MathComponent<Operation, B>> {

    public constructor(
        public readonly by: number,
        public readonly operation: Operation
    ) {
        super() 
    }
    
    protected _is = is.number

    protected _execute = math[this.operation](this.by).execute

    protected _transfer = transfer(
        (ctx: TransferContext<number, number, MathComponent<Operation, B>>) => 
            ctx.targets.find(target => target.operation === this.operation) ?? null
    )

    protected _errors = 
        handle
        (isNaN, i => new Error(`Must be a number: ${i}`))
        ((i: number) => i % 2 === 0, () => new Error('Must be even'))

}

/* eslint-disable @typescript-eslint/explicit-function-return-type */

function handle <I, O extends Error>(
    this: void | [{ execute: Execute<I,O>, isError: TypeGuard<I> | ((input: I) => boolean) }],
    isError: TypeGuard<I> | ((input: I) => boolean), 
    execute: Execute<I, O>
) {
    
    const _handle = (
        isError: TypeGuard<I> | ((input: I) => boolean), 
        execute: Execute<I, O>
    ) => {
        _handle.errors.push({ isError, execute })
        return _handle
    }
    _handle.errors = [{ isError, execute }]

    return _handle
}