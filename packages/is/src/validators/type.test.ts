
import { isNumber, nil, returns } from '@benzed/util'

import { TypeValidator } from './type'

//// Setup ////

const $number = new TypeValidator({
    is: isNumber,
    type: 'number'
})

//// Tests ////

it('creates validator for a specific type', () => {
    expect($number(10)).toEqual(10)
})

it('throws with type name', () => {
    expect(() => $number('sup')).toThrow('Must be type number')
})

describe('cast' , () => {

    const fromString = (i: unknown): unknown => typeof i === 'string' ? parseFloat(i) : i

    it('allows for data to be casted', () => {

        const $serializedNumber = new TypeValidator({
            ...$number,
            cast: fromString
        })

        expect($serializedNumber('100'))
            .toEqual(100)

    })

})

describe('default', () => {

    const $zero = new TypeValidator({
        ...$number,
        default: returns(0)
    })

    it('allows a default value to be set in case of nil', () => {
        expect($zero(nil)).toEqual(0)
    })

})