import NumberSchema from './number-schema'
import ArraySchema from './array-schema'

import { expectValidationError } from '../util.test'
import ShapeSchema from './shape-schema'
import StringSchema from './string-schema'

/*** Input ***/

const $buffer = new ArraySchema(new NumberSchema())

// TODO move me

describe('validate()', () => {

    it('validates arrays', () => {
        expect($buffer.validate([0, 1, 2, 3, 4, 5, 6]))
            .toEqual([0, 1, 2, 3, 4, 5, 6])

    })

    it('validates children', () => {
        const expectError = expectValidationError(() => $buffer.validate([0, 'One', 2]))
        expectError.toHaveProperty('path', [1])
        expectError.toHaveProperty('message', 'One is not number')
    })

    it('validates nested children', () => {

        const $tokens = new ArraySchema(new ShapeSchema({
            payload: new StringSchema(),
            referrer: new StringSchema(),
            expiration: new NumberSchema()
        }))

        expectValidationError(
            () => $tokens.validate([
                { payload: '1ag4az', referrer: 'adfa', expiration: 100 },
                { payload: '1ag4az', referrer: 'adfa', expiration: 'never lol' },
            ])
        ).toHaveProperty('path', [1, 'expiration'])
    })

})
