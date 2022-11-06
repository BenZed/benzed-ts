import { expectTypeOf } from 'expect-type'
import { Component, InputOf, OutputOf } from './component'

//// Setup ////

const parse = { compute: parseFloat }

class Parse extends Component<string, number> {
    compute = parseFloat
}

//// Tests ////

describe(`Component.is`, () => {

    it(`returns true for Component instances`, () => {
        expect(Component.is(new Parse())).toBe(true)
    })

    it(`returns true for objects that are structurally components`, () => {
        expect(Component.is(parse)).toBe(true)
    })

})

describe(`Component.from`, () => {

    it(`converts a compute method into a component`, () => {
        const parse = Component.from(parseFloat)
        expect(parse.compute).toEqual(parseFloat)
    })

    it(`does nothing if input is already a component`, () => {
        expect(Component.from(parse)).toEqual(parse)
    })

})

describe(`types`, () => {

    it(`Component InputOf`, () => {
        type ParseInput = InputOf<Parse>
        expectTypeOf<ParseInput>().toEqualTypeOf<string>()
    })

    it(`Component OutputOf`, () => {
        type ParseOutput = OutputOf<Parse>
        expectTypeOf<ParseOutput>().toEqualTypeOf<number>()
    })

    it(`Compute InputOf`, () => {
        type ParseInput = InputOf<typeof parseFloat>
        expectTypeOf<ParseInput>().toEqualTypeOf<string>()
    })

    it(`Compute OutputOf`, () => {
        type ParseOutput = OutputOf<typeof parseFloat>
        expectTypeOf<ParseOutput>().toEqualTypeOf<number>()
    })

})

it(`class Components bind compute method on construction`, () => {

    class X2 extends Component<number> {
        compute(input: number): number {
            return input * 2
        }
    }

    const result = [1].map(new X2().compute)
    expect(result).toEqual([2])

})