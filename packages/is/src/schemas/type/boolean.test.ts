import { $boolean } from './boolean'

import { nil } from '@benzed/util'

//// Tests ////

it('validates booleans', () => {
    expect($boolean(true)).toEqual(true)
    expect($boolean(false)).toEqual(false)
  
    expect(() => $boolean('what'))
        .toThrow('Must be boolean')
}) 

it('casts "true" to true', () => { 
    expect($boolean('true'))
        .toEqual(true)
})

it('casts "false" to false', () => {
    expect($boolean('false')) 
        .toEqual(false)
})

it('default name', () => {
    expect($boolean).toHaveProperty('name', 'boolean')
}) 

it('default()', () => {
    expect($boolean.default(false)(nil)).toBe(false)
    expect($boolean.default(() => true)(nil)).toBe(true)
})
 