import { defineComponent, Component, InputOf, OutputOf } from './component'

import { expectTypeOf } from 'expect-type'

/*** Lint ***/

/* eslint-disable 
    @typescript-eslint/no-non-null-assertion,
    @typescript-eslint/no-explicit-any
*/

/*** Test ***/

it('component can just be a function', () => {

    const multiply = (values: [number,number]): number => values[0] * values[1]

    expectTypeOf<InputOf<typeof multiply>>().toEqualTypeOf<[number, number]>()
    expectTypeOf<OutputOf<typeof multiply>>().toEqualTypeOf<number>()
    
})

it('stateless components can be defined via define component', () => {

    const createMultiplyEntity = 
        defineComponent((data: { by: number }) => (i: number) => i * data.by)

    const x3 = createMultiplyEntity({ by: 3 })
    expectTypeOf<typeof x3>().toEqualTypeOf<Component<number, number> & { by: number }>()

})

it('define stateful ')

it('clean type signature', () => {

    interface Multiply extends Component<number, number> {
        by: number
    }

    const createMultiplyEntity = defineComponent<Multiply>(data => i => i * data.by)

    const x5 = createMultiplyEntity({ by: 5 })

    expectTypeOf<typeof x5>().toEqualTypeOf<Multiply>()

})