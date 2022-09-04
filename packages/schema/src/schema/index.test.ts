import { $, Infer } from './index'

import BooleanSchema from './boolean-schema'
import NumberSchema from './number-schema'
import StringSchema from './string-schema'
import ShapeSchema from './shape-schema'
import ArraySchema from './array-schema'
import RecordSchema from './record-schema'
import UnionSchema from './union-schema'
import IntersectionSchema from './intersection-schema'
import TupleSchema from './tuple-schema'

import { expectTypeOf } from 'expect-type'
import { NullSchema, UndefinedSchema } from './schema'

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
    ['or', UnionSchema, new NumberSchema(), new StringSchema()],
    ['null', NullSchema],
    ['undefined', UndefinedSchema]

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

describe('shortcut type tests', () => {

    it('primitives', () => {

        const $null = $.null()
        expectTypeOf<Infer<typeof $null>>().toEqualTypeOf<null>()

        const $undefined = $.undefined()
        expectTypeOf<Infer<typeof $undefined>>().toEqualTypeOf<undefined>()

        const $number = $.number()
        expectTypeOf<Infer<typeof $number>>().toEqualTypeOf<number>()

        const $boolean = $.boolean()
        expectTypeOf<Infer<typeof $boolean>>().toEqualTypeOf<boolean>()

        const $string = $.string().optional()
        expectTypeOf<Infer<typeof $string>>().toEqualTypeOf<string | undefined>()
    })

    it('shapes', () => {

        const $vector = $({
            x: $.number().mutable(),
            y: $.number().mutable(),
            z: $.number().optional()
        })

        expectTypeOf<Infer<typeof $vector>>().toEqualTypeOf<{
            x: number
            y: number
            readonly z?: number
        }>()

    })

    it('arrays', () => {

        const $optionalStringArr = $.array($.string().mutable()).optional()
        expectTypeOf<Infer<typeof $optionalStringArr>>()
            .toEqualTypeOf<string[] | undefined>()

        const $optionalNumArr = $.array($.number().optional())
        expectTypeOf<Infer<typeof $optionalNumArr>>()
            .toEqualTypeOf<readonly (number | undefined)[]>()

        const $todo = $({
            complete: $.boolean().mutable(),
            description: $.string().mutable(),
        })

        const $todoArray = $.array($todo)
        expectTypeOf<Infer<typeof $todoArray>>()
            .toEqualTypeOf<readonly { complete: boolean, description: string }[]>()

    })

    it('records', () => {

        const $switches = $.record($.boolean())
        expectTypeOf<Infer<typeof $switches>>()
            .toEqualTypeOf<{ readonly [key: string]: boolean }>()

        const $scores = $.record($.number().mutable())
        expectTypeOf<Infer<typeof $scores>>()
            .toEqualTypeOf<{ [key: string]: number }>()

    })

})