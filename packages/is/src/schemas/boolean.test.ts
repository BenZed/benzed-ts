import { nil } from '@benzed/util'
import { BooleanSchema } from './boolean'

//// Tests ////

const isBoolean = new BooleanSchema()  

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
 