import NumberSchema from './number-schema'
import TupleSchema from './tuple-schema'

import { expectValidationError } from '../util.test'
import ShapeSchema from './shape-schema'
import StringSchema from './string-schema'

/*** Input ***/

const $name = new TupleSchema([new StringSchema(), new StringSchema()])

// TODO move me

describe('validate()', () => {

    it('validates tuples', () => {
        expect($name.validate(['first-name', 'last-name']))
            .toEqual(['first-name', 'last-name'])
    })

    it('validates children', () => {
        const expectError = expectValidationError(() => $name.validate([{
            toString() {
                return 'object'
            }
        }, 'one']))
        expectError.toHaveProperty('path', [0])
        expectError.toHaveProperty('message', 'object is not string')
    })

    it('validates nested children', () => {

        const $vector = new ShapeSchema({
            x: new NumberSchema().mutable(),
            y: new NumberSchema().mutable()
        })

        const $edge = new TupleSchema([$vector, $vector] as const)

        expectValidationError(
            () => $edge.validate([
                { x: 0, y: 1 },
                { x: 0, y: 'One' },
            ])
        ).toHaveProperty('path', [1, 'y'])
    })

})