
import { type } from './type'

const $number = type({
    is: (i): i is number => typeof i === 'number',
    name: 'number'
})

it('creates schema for a specific type', () => {
    expect($number(10)).toEqual(10)
})

it('throws with type name', () => {
    expect(() => $number('sup')).toThrow('must be a number')
})

describe('cast' , () => {

    it('allows for data to be casted', () => {

        const $serializedNumber = $number
            .cast(i => typeof i === 'string' ? parseFloat(i) : i)

        expect($serializedNumber('100'))
            .toEqual(100)

    })

})