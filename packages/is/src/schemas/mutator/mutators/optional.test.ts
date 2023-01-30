import { isArray, isString as _isString, nil } from '@benzed/util'
import { Validator } from '@benzed/schema'

import { Optional } from './optional'
// import { isString } from '../schema'

import { it, expect } from '@jest/globals'
import { expectTypeOf } from 'expect-type'
import { ReadOnly } from './readonly'
import { MutatorType } from '../mutator'
import { eachMutator } from '../mutator-operations'

//// EsLint ////

/* eslint-disable 
    @typescript-eslint/ban-types
*/

//// Setup ////

interface String extends Validator<unknown, string> {}

const $string: String = new Validator({ is: _isString, error: 'Must be a string' })
const $optionalString = new Optional($string)

interface ArrayOfString extends Validator<unknown, string[]> {}
const $arrayOfString: ArrayOfString = new Validator({
    error: 'Must be an array of string',
    is: (i): i is string[] => isArray(i, _isString)
}) 
 
//// Tests ////
 
it('Makes a schematic optional', () => {
    expect($optionalString('')).toBe('')
    expect($optionalString(nil)).toBe(nil)
})
 
it('doesnt nest', () => { 
    const $optionalString2 = new Optional($optionalString)
    expect($optionalString2).toHaveProperty('target', $string) 
    expectTypeOf($optionalString2).toEqualTypeOf<Optional<String>>()  
  
    const $optionalReadonlyArrayOfString = new Optional(new ReadOnly(new Optional($arrayOfString)))

    let numOptionals = 0
    for (const mutator of eachMutator($optionalReadonlyArrayOfString)) {
        if (mutator.mutator === MutatorType.Optional)
            numOptionals++
    }
    expect(numOptionals).toBe(1)

})

// it('preserves defaults', () => {
//     expect(OptionalString.default('Cake').validate(nil))
//         .toEqual('Cake')
// })

it('required', () => {
    const $string = $optionalString.required
    expect($string('')).toBe('')
    expect(() => $string(nil)).toThrow('Must be a string')
})