import { defineEntity, Entity, InputOf, OutputOf } from './entity'

import { expectTypeOf } from 'expect-type'

/*** Lint ***/

/* eslint-disable 
    @typescript-eslint/no-non-null-assertion,
    @typescript-eslint/no-explicit-any
*/

/*** Test ***/

it('entity can just be a function', () => {

    const multiply = (values: [number,number]): number => values[0] * values[1]

    expectTypeOf<InputOf<typeof multiply>>().toEqualTypeOf<[number, number]>()
    expectTypeOf<OutputOf<typeof multiply>>().toEqualTypeOf<number>()
    
})

it('stateless entities can be defined via define entity', () => {

    const createMultiplyEntity = defineEntity((data: { by: number }) => (i: number) => i * data.by)

    const x3 = createMultiplyEntity({ by: 3 })
    expectTypeOf<typeof x3>().toEqualTypeOf<Entity<number, number> & { by: number }>()

})

it('clean type signature', () => {

    interface Multiply extends Entity<number, number> {
        by: number
    }

    const createMultiplyEntity = defineEntity<Multiply>(data => i => i * data.by)

    const x5 = createMultiplyEntity({ by: 5 })

    expectTypeOf<typeof x5>().toEqualTypeOf<Multiply>()

})