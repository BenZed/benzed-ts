import Struct, { StructCallable } from './struct'

//// Setup ////

class Scalar extends Struct {
    constructor(protected value: number) {
        super()
    }
}

//// Data ////

const scalar = new Scalar(10)
 
//// Tests ////

test('copy()', () => {
    expect(scalar.copy()).not.toBe(scalar)
}) 

test('equals()', () => {
    expect(scalar.copy().equals(scalar)).toBe(true)
})

test('instanceof', () => {
    expect(scalar).toBeInstanceOf(scalar.constructor)
    expect(scalar.copy()).toBeInstanceOf(scalar.constructor)
})

//// Works with methods ////

// class Multiply extends StructCallable<(i: number) => number> {
//     constructor(public by: number) {
//         super(i => i * this.by)
//     }
// }

it('works with methods', () => {
    // const x2 = new Multiply(2)
    // expect(x2.by).toEqual(2)
    // expect(x2(2)).toEqual(4)

    // expect(x2.copy()).not.toBe(x2)
    // expect(x2).toBeInstanceOf(Multiply)
    // expect(x2).toBeInstanceOf(Struct)

    // expect(x2.copy().equals(x2)).toBe(true)
})