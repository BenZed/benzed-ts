import NumberSchema from './number-schema'
import ShapeSchema from './shape-schema'
import BoolSchema from './boolean-schema'
import StringSchema from './string-schema'

import { expectValidationError } from '../util.test'

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

})
