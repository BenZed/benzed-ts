
import { expectValidationError } from '../util.test'

import UnionSchema from './union-schema'

import StringSchema from './string-schema'
import BooleanSchema from './boolean-schema'

/*** Input ***/

const $stringOrBool = new UnionSchema([new StringSchema(), new BooleanSchema()])

// TODO move me

describe('validate()', () => {

    it('validates unions', () => {
        expect($stringOrBool.validate('str'))
            .toEqual('str')

        expect($stringOrBool.validate(true))
            .toEqual(true)

        expectValidationError(() => $stringOrBool.validate(100))
            .toHaveProperty('message', '100 is not string or boolean')
    })

})
