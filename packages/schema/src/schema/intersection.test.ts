
import { expectValidationError } from '../util.test'

import IntersectionSchema from './intersection'

import ShapeSchema from './shape'
import NumberSchema from './number'

//// Input ////

const $vector = new IntersectionSchema([
    new ShapeSchema({ x: new NumberSchema() }),
    new ShapeSchema({ y: new NumberSchema() })
])

// TODO move me

describe(`validate()`, () => {

    it(`validates intersections`, () => {
        expect($vector.validate({ x: 0, y: 0 }))
            .toEqual({ x: 0, y: 0 })

        expectValidationError(() => $vector.validate(`ace`))
            .toHaveProperty(
                `message`,
                `must be an object`
            )

        const expectError = expectValidationError(() => $vector.validate({ x: `One`, y: 1 }))
        expectError.toHaveProperty(
            `message`,
            `must be a number`
        )
        expectError.toHaveProperty(
            `path`,
            [`x`]
        )

    })

})
