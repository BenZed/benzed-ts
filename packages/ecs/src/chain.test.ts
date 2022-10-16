
import { Component, ComponentInput, ComponentOutput, SwitchComponent } from './component'
import { Chain } from './chain'
import { expectTypeOf } from 'expect-type'

/*** Components ***/

class Parse extends SwitchComponent<string, number> {
    
    protected _compute(input: string): number {
        return parseInt(input)
    }

}

class Double extends SwitchComponent<number, number> {

    protected _compute(input: number): number {
        return input * 2
    }
}

class Shout extends SwitchComponent<number, string> {
    protected _compute(input: number): string {
        return `${input}!`
    }
}

/*** Tests ***/

it('allows multiple components to be chained together', () => {

    const x4 = Chain.create(new Parse())
        .push(new Double())
        .push(new Double())
        .push(new Shout())

    type X4Input = ComponentInput<typeof x4>
    type X4Output = ComponentOutput<typeof x4>

    expectTypeOf<X4Input>().toEqualTypeOf<string>()
    expectTypeOf<X4Output>().toEqualTypeOf<string>()

})