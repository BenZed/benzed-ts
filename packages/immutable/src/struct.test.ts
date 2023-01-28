
import { CallableStruct, Struct, StructAssignState } from './struct'

import { expectTypeOf } from 'expect-type'
//// Setup ////

class Scalar extends Struct {

    constructor(readonly value: number) {
        super()
    }
}  

//// Tests //// 

it('state', () => { 
    const scalar = new Scalar(5)

    const state = { ...scalar }
    expect(state).toEqual({ value: 5 })
    expectTypeOf(state).toEqualTypeOf<{ value: number }>()

})

it('$$assign method', () => {

    class Vector extends Scalar {

        static sum (values: readonly number[]): number {
            return values.reduce((v,c) => v + c)
        }

        constructor(readonly values: readonly number[]) {
            super(Vector.sum(values))
        }

        protected [Struct.$$assign](state: StructAssignState<this>): StructAssignState<this> {

            const values = 'values' in state
                ? state.values as number[]
                : this.values

            return {
                ...state,
                value: Vector.sum(values)
            }
        }
    }

    const avg3 = new Vector([1,2,3,6])
    expect({ ...avg3 }).toEqual({ value: 12, values: [1,2,3,6] })

    const avg4 = Vector.apply(avg3, { values: [1,2,3] })
    expect({ ...avg4 }).toEqual({ values: [1,2,3], value: 6 })
})

it('apply', () => {

    const scalar1 = new Scalar(0)
    const scalar2 = Struct.apply(scalar1, { value: 10 })
    expect(scalar2).toBeInstanceOf(Scalar)
    expect(scalar2).toHaveProperty('value', 10)
    expect(scalar1).not.toBe(scalar2)

    const scalar3 = Struct.apply(scalar1, scalar2)
    expect(scalar3).toBeInstanceOf(Scalar)
    expect(scalar2).toHaveProperty('value', 10)
    expect(scalar1).not.toBe(scalar2)
})

it('callable', () => {
    
    class Average extends CallableStruct<() => number> {

        readonly values: number[]

        constructor(...values: number[]) {
            super(function () {
                return this.values.reduce((a,c) => a + c) / this.values.length
            })
            this.values = values
        }

    }

    const two = new Average(1,2,3)
    expect(two()).toEqual(2)
    expect({ ...two }).toEqual({ values: [1,2,3 ]})
    expectTypeOf({ ...two }).toEqualTypeOf({ values: [1,2,3 ]})

    const five = Average.apply(two, { values: [5] })
    expect(five()).toEqual(5)
    expect({ ...five }).toEqual({ values: [5] })
    expectTypeOf({ ...five }).toEqualTypeOf({ values: [5] }) 

})