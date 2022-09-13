
import NumberSchema from './number'
import StringSchema from './string'
import ShapeSchema from './shape'
import BoolSchema from './boolean'

import {
    expectValidationError
} from '../util.test'

/*** Input ***/

const $vector = new ShapeSchema({
    x: new NumberSchema(),
    y: new NumberSchema()
})

const $todo = new ShapeSchema({
    completed: new BoolSchema().mutable(),
    description: new ShapeSchema({
        content: new StringSchema(),
        deadline: new NumberSchema()
    }).mutable()
})

// TODO move me

describe('validate()', () => {

    it('validates shapes', () => {
        expect($vector.validate({ x: 0, y: 0 }))
            .toEqual({ x: 0, y: 0 })

        expect(() => $vector.validate(false))
            .toThrow('false is not object')
    })

    it('validates children', () => {
        const expectError = expectValidationError(() => $vector.validate({ x: 0, y: 'One' }))
        expectError.toHaveProperty('path', ['y'])
        expectError.toHaveProperty('message', 'One is not number')
    })

    it('validates nested children', () => {
        expectValidationError(
            () => $todo.validate({
                completed: true,
                description: {
                    content: 'Complete this schema validation library',
                    deadline: 'never lol'
                }
            })
        ).toHaveProperty('path', ['description', 'deadline'])
    })

    it('omits unspecified properties', () => {
        expect($vector.validate({ x: 10, y: 20, z: 100 }))
            .toEqual({ x: 10, y: 20 })
    })

})

describe('default()', () => {

    it('defaults to constructed object', () => {

        const $hash = new ShapeSchema({
            secret: new StringSchema(),
            count: new NumberSchema(),
            flag: new BoolSchema()
        })

        expect(
            $hash
                .default()
                .validate(undefined)
        ).toEqual({ secret: '', count: 0, flag: false })
    })

    it('default constructed object respects nested default values', () => {

        const $count = new ShapeSchema({
            value: new NumberSchema(10)
        })

        expect(
            $count
                .default()
                .validate(undefined)
        ).toEqual({ value: 10 })
    })

    it('respects default setting, if valid', () => {
        expect(
            $vector
                .default({ x: 10, y: 10 })
                .validate(undefined)
        ).toEqual({ x: 10, y: 10 })
    })

})