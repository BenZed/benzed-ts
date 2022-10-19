import { Component } from '../component'
import { TransferContext, Node } from './node'

it('seperates execution and transfer logic', () => {

    class IsPositiveNode extends Node<Component<number, boolean>> {

        public constructor() {
            super({ 
                execute: i => i > 0
            }) 
        }
        
        protected _transfer(
            ctx: TransferContext<Component<number, boolean>>
        ): Component<boolean, unknown> | null {
            return ctx.output ? ctx.targets[0] : ctx.targets[ctx.targets.length - 1]
        }

        public isInput(value: unknown): value is number {
            return typeof value === 'number'
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