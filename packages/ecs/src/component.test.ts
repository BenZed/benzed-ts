import { expectTypeOf } from 'expect-type'
import { InputOf, isComponent, OutputOf } from './component'

it('a component is simply an object that wraps an execute function', () => {

    expect(
        isComponent({
            execute: parseFloat
        })
    ).toBe(true)

})

it('component input via InputOf', () => {

    const parseComponent = { execute: parseFloat }

    type ParseInput = InputOf<typeof parseComponent>
    type ParseOutput = OutputOf<typeof parseComponent>

    expectTypeOf<ParseInput>().toEqualTypeOf<string>()
    expectTypeOf<ParseOutput>().toEqualTypeOf<number>()

})