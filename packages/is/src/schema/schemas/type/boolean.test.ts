import { Boolean } from './boolean'

import { nil } from '@benzed/util'

//// Tests ////

const isBoolean = new Boolean()  

it('validates booleans', () => {
    expect(isBoolean.validate(true)).toEqual(true)
    expect(isBoolean.validate(false)).toEqual(false)
  
    expect(() => isBoolean.validate('what'))
        .toThrow('Must be type boolean')
}) 

it('casts "true" to true', () => {
    expect(isBoolean.validate('true'))
        .toEqual(true)
})  

it('casts "false" to false', () => {
    expect(isBoolean.validate('false')) 
        .toEqual(false)
})

it('default()', () => {

    expect(isBoolean.default(false).validate(nil)).toBe(false)
    expect(isBoolean.default(() => true).validate(nil)).toBe(true)
})
 