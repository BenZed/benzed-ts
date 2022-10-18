import { Component } from '../component'
import { TransferContext, TransferNode } from './transfer-node'

it('seperates execution and transfer logic', () => {

    class IsPositiveNode extends TransferNode<number, boolean> {

        protected _execute(input: number): boolean {
            return input > 0
        }

        protected _transfer(
            ctx: TransferContext<number, boolean>
        ): Component<boolean, unknown> | null {
            return ctx.output ? ctx.targets[0] : ctx.targets[ctx.targets.length - 1]
        }

    }

    const say1 = { execute: (i: boolean) => i ? 'yay' : 'nay' }

    const pos = new IsPositiveNode()

    expect(
        pos.execute({
            targets: [say1],
            input: 10
        })
    ).toEqual({
        target: say1,
        output: true
    })

})