
import { expectValidationError } from '../util.test'

import UnionSchema from './union'

import StringSchema from './string'
import BooleanSchema from './boolean'

//// Input ////

const $stringOrBool = new UnionSchema([new StringSchema(), new BooleanSchema()])

// TODO move me

describe('validate()', () => {

    it('validates unions', () => {
        expect($stringOrBool.validate('str'))
            .toEqual('str')

        expect($stringOrBool.validate(true))
            .toEqual(true)

        expectValidationError(() => $stringOrBool.validate(100))
            .toHaveProperty('message', 'must be string or boolean')
    })

})
