import { expectTypeOf } from 'expect-type'
import { InputOf, OutputOf } from './component'

it('component input via InputOf', () => {

    const parseComponent = { execute: parseFloat }

    type ParseInput = InputOf<typeof parseComponent>
    type ParseOutput = OutputOf<typeof parseComponent>

    expectTypeOf<ParseInput>().toEqualTypeOf<string>()
    expectTypeOf<ParseOutput>().toEqualTypeOf<number>()

})