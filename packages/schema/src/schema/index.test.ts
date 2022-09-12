import { $, Infer } from './index'

import IntersectionSchema from './intersection'
import UndefinedSchema from './undefined'
import BooleanSchema from './boolean'
import NumberSchema from './number'
import StringSchema from './string'
import ShapeSchema from './shape'
import ArraySchema from './array'
import RecordSchema from './record'
import UnionSchema from './union'
import TupleSchema from './tuple'
import NullSchema from './null'

import { expectTypeOf } from 'expect-type'

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

    it('nested shapes', () => {

        const $todo = $({
            completed: $.boolean().mutable(),
            description: $({
                content: $.string(),
                deadline: $.number()
            }).mutable()
        })

        type Todo = Infer<typeof $todo>
        expectTypeOf<Todo>().toEqualTypeOf<{
            completed: boolean
            description: {
                readonly content: string
                readonly deadline: number
            }
        }>()

    })

    it('arrays', () => {

        const $optionalStringArr = $.array($.string()).mutable().optional()
        expectTypeOf<Infer<typeof $optionalStringArr>>()
            .toEqualTypeOf<string[] | undefined>()

        const $optionalNumArr = $.array($.number().optional())
        expectTypeOf<Infer<typeof $optionalNumArr>>()
            .toEqualTypeOf<readonly (number | undefined)[]>()

        const $todo = $({
            complete: $.boolean().mutable(),
            description: $.string(),
        })

        const $todoArray = $.array($todo)
        expectTypeOf<Infer<typeof $todoArray>>()
            .toEqualTypeOf<readonly { complete: boolean, readonly description: string }[]>()
    })

    it('records', () => {

        const $switches = $.record($.boolean())
        expectTypeOf<Infer<typeof $switches>>()
            .toEqualTypeOf<Readonly<Record<string, boolean>>>()

        const $scores = $.record($.number().mutable())
        expectTypeOf<Infer<typeof $scores>>()
            .toEqualTypeOf<Record<string, number>>()
    })

    it('enums', () => {
        const $trafficLight = $('red', 'green', 'yellow')
        expectTypeOf<Infer<typeof $trafficLight>>()
            .toEqualTypeOf<'red' | 'green' | 'yellow'>()
    })

    it('tuples', () => {
        const $range = $.tuple($.number(), $.number())
        expectTypeOf<Infer<typeof $range>>()
            .toEqualTypeOf<readonly [number, number]>()

        const $between = $.tuple($.number(), $.or($('<'), $('>')), $.number()).mutable()
        expectTypeOf<Infer<typeof $between>>()
            .toEqualTypeOf<[number, '<' | '>', number]>()
    })

    it('unions', () => {

        const $id = $.or($.string(), $.number())
        expectTypeOf<Infer<typeof $id>>()
            .toEqualTypeOf<string | number>()
    })

    it('intersections', () => {

        const $quaternion = $.and(
            $({
                x: $.number().mutable(),
                y: $.number().mutable(),
                z: $.number().mutable()
            }),
            $({ w: $.number().mutable().optional() })
        )

        expectTypeOf<Infer<typeof $quaternion>>()
            .toEqualTypeOf<{ x: number, y: number, z: number } & { w?: number }>()
    })

})