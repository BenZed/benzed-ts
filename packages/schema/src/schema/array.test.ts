import NumberSchema from './number'
import ArraySchema from './array'

import ShapeSchema from './shape'
import StringSchema from './string'

import { expectValidationError } from '../util.test'

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

describe('length()', () => {

    const $polygon = new ArraySchema(new ShapeSchema({
        x: new NumberSchema(),
        y: new NumberSchema()
    })).length('3...4')

    it('instances a new schema with a length validator', () => {

        const square = [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 0, y: 1 }]

        expect($polygon.validate(square))
            .toEqual(square)

        expectValidationError(() => $polygon.validate(square.slice(2)))
            .toHaveProperty('message', 'length must be from 3 to 4')

    })

    it('length validator settings cant be below 0', () => {
        expect(() => $polygon.length(-1))
            .toThrow('cannot validate length below 0')
    })

    it('length validator settings must be integers', () => {
        expect(() => $polygon.length(3.5))
            .toThrow('value must be an integer')
    })
})