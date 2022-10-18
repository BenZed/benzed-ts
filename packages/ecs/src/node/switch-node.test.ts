import { SwitchNode } from './switch-node'

it('alternates input on every invocation', () => {

    const targets = [2,3,4,5].map(by => ({ execute: (i:number) => i * by }))

    const switcher = SwitchNode.create(parseFloat)

    // iterates through every target
    for (const target of targets) {
        expect(
            switcher.execute({
                input: '10',
                targets
            })
        ).toEqual(
            {
                output: 10,
                target
            }
        )
    }

})