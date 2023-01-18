
import { isNumber, nil, returns } from '@benzed/util'

import { TypeValidator } from './type'

//// Setup ////

const isNum = new TypeValidator({  
    is: isNumber,
    name: 'number'
})  

//// Tests ////

it('creates validator for a specific type', () => {
    expect(isNum(10)).toEqual(10)
})

it('throws with type name', () => {
    expect(() => isNum('sup')).toThrow('Must be type number')
})

describe('cast' , () => {

    const fromString = (i: unknown): unknown => typeof i === 'string' 
        ? parseFloat(i) 
        : i

    it('allows for data to be casted', () => {

        const isSerializedNumber = new TypeValidator({
            ...isNum,
            cast: fromString
        }) 

        expect(isSerializedNumber('100'))
            .toEqual(100)
 
    })

})

describe('default', () => {

    const isZero = new TypeValidator({
        ...isNum,
        default: returns(0)
    })

    it('allows a default value to be set in case of nil', () => {
        expect(isZero(nil)).toEqual(0)
    })

})