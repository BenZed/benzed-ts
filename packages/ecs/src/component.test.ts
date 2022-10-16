import { expectTypeOf } from 'expect-type'
import { Component } from './component'
import { InputOf, OutputOf } from './entity'

/*** Setup ***/

class Multiply extends Component<number, number, { by: number}> {

    public execute(input: number): number {
        return input * this.settings.by
    }
    
}

/*** Test ***/

it('InputOf works on components', () => {

    const x2 = new Multiply({ by: 2 })

    expectTypeOf<InputOf<typeof x2>>().toEqualTypeOf<number>()

})

it('InputOf works on components', () => {

    const x3 = new Multiply({ by: 3 })

    expectTypeOf<OutputOf<typeof x3>>().toEqualTypeOf<number>()

})

