import { $ } from './index'

import BooleanSchema from './boolean-schema'
import NumberSchema from './number-schema'
import StringSchema from './string-schema'
import ShapeSchema from './shape-schema'
import ArraySchema from './array-schema'
import RecordSchema from './record-schema'
import UnionSchema from './union-schema'
import IntersectionSchema from './intersection-schema'
import TupleSchema from './tuple-schema'

/* eslint-disable 
    @typescript-eslint/no-explicit-any
*/

for (const [key, SchemaType, ...args] of [
    ['number', NumberSchema],
    ['boolean', BooleanSchema],
    ['string', StringSchema],
    ['shape', ShapeSchema, { property: new BooleanSchema() }],
    ['record', RecordSchema, new NumberSchema()],
    ['array', ArraySchema, new StringSchema()],
    ['tuple', TupleSchema, new NumberSchema(), new NumberSchema()],
    [
        'and',
        IntersectionSchema,
        new ShapeSchema({ x: new NumberSchema() }),
        new ShapeSchema({ y: new NumberSchema() })
    ],
    ['or', UnionSchema, new NumberSchema(), new StringSchema()]
] as const) {

    it(`$.${key}() creates ${SchemaType.name}`, () => {
        const $schema = ($ as any)[key](...args)
        expect($schema).toBeInstanceOf(SchemaType)
    })

}

describe('$() shortcut', () => {

    it('allows shapes', () => {
        const $vector = $({
            x: $.number(),
            y: $.number()
        })

        expect($vector).toBeInstanceOf(ShapeSchema)
    })

    it('allows tuples', () => {
        const $range = $($.number(), $.number())
        expect($range).toBeInstanceOf(TupleSchema)
    })

    it('allows unions', () => {
        const $trafficLight = $('green', 'yellow', 'red')
        expect($trafficLight).toBeInstanceOf(UnionSchema)
    })

})
