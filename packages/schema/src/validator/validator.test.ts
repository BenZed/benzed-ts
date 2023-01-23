import { isString } from '@benzed/util'
import { describe } from '@jest/globals'

import { expectTypeOf } from 'expect-type'
import { Validator } from './validator'

import { testValidator } from './util.test'

//// Setup ////

//// Tests ////

describe('is option', () => {

    const $string = new Validator({
        is: isString
    }) 

    it.skip('infers name', () => {
        expect($string).toHaveProperty('name', 'string')
    })

    it('equal type Validator<unknown,string>', () => {
        expectTypeOf($string).toEqualTypeOf<Validator<unknown,string>>()
    })

    testValidator($string, { input: 'string', output: 'string' })
    testValidator($string, { input: 0, error: 'Validation failed.' })
})
