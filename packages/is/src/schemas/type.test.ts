
import { nil, returns } from '@benzed/util/lib'
import { type } from './type'

//// Setup ////

const $number = type({
    isType: (i): i is number => typeof i === 'number',
    name: 'number'
})

//// Tests ////

it('creates schema for a specific type', () => {
    expect($number(10)).toEqual(10)
})

it('throws with type name', () => {
    expect(() => $number('sup')).toThrow('must be a number')
})

describe('cast' , () => {

    const fromString = (i: unknown): unknown => typeof i === 'string' ? parseFloat(i) : i

    it('allows for data to be casted', () => {

        const $serializedNumber = $number
            .cast(fromString)

        expect($serializedNumber('100'))
            .toEqual(100)

    })

    it('other validators are preserved', () => {

        const $even = $number.transforms(i => i - i % 2, 'Must be even')
        expect($even(3)).toEqual(2)

        const $evenCast = $even.cast(fromString)

        expect($evenCast(3)).toEqual(2)
        expect($evenCast('3')).toEqual(2)

    })

})

describe('default', () => {

    const $zero = $number.default(0)

    it('allows a default value to be set in case of nil', () => {
        expect($zero(nil)).toEqual(0)
    })

    it('can take a method', () => {
        const $one = $zero.default(returns(1))
        expect($one(nil)).toEqual(1)
    })

    it('can be removed', () => {
        const $number = $zero.default(nil)
        expect(() => $number(nil)).toThrow('must be a number')
    })

})