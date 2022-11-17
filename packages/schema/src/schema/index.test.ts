import { is } from '@benzed/is'

import { $, Infer } from './index'

import IntersectionSchema from './intersection'
import BooleanSchema from './boolean'
import NumberSchema from './number'
import StringSchema from './string'
import ShapeSchema from './shape'
import ArraySchema from './array'
import RecordSchema from './record'
import UnionSchema from './union'
import TupleSchema from './tuple'

import { expectTypeOf } from 'expect-type'

/* eslint-disable 
        @typescript-eslint/no-explicit-any
    */

for (const [key, SchemaType, ...args] of [
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

    it(`$.${key} creates ${SchemaType.name}`, () => {
        const $schema = ($ as any)[key](...args)
        expect($schema).toBeInstanceOf(SchemaType)
    })

}

describe('$() shortcut', () => {

    it('allows shapes', () => {
        const $vector = $({
            x: $.number,
            y: $.number
        })

        expect($vector).toBeInstanceOf(ShapeSchema)
    })

    it('allows tuples', () => {
        const $range = $($.number, $.number)
        expect($range).toBeInstanceOf(TupleSchema)
    })

    it.todo('allows enums')

    it('allows constructors', () => {
        class Foo {}
        class Bar {}

        const foo = new Foo()

        const $foo = $(Foo)
        
        expect($foo.validate(foo))
            .toEqual(foo)
        
        expect(() => $foo.validate(new Bar()))
            .toThrow('must be Foo')
        
    })

    it('does not allow Symbol', () => {
        // @ts-expect-error Symbol is not a constructor
        $(Symbol)
    })

})

describe('shortcut type tests', () => {

    it('primitives', () => {

        const $null = $.null
        expectTypeOf<Infer<typeof $null>>().toEqualTypeOf<null>()

        const $undefined = $.undefined
        expectTypeOf<Infer<typeof $undefined>>().toEqualTypeOf<undefined>()

        const $number = $.number
        expectTypeOf<Infer<typeof $number>>().toEqualTypeOf<number>()

        const $boolean = $.boolean
        expectTypeOf<Infer<typeof $boolean>>().toEqualTypeOf<boolean>()

        const $string = $.string.optional
        expectTypeOf<Infer<typeof $string>>().toEqualTypeOf<string | undefined>()
    })

    it('shapes', () => {

        const $vector = $({
            x: $.number.mutable,
            y: $.number.mutable,
            z: $.number.optional
        })

        expectTypeOf<Infer<typeof $vector>>().toEqualTypeOf<{
            x: number
            y: number
            readonly z?: number
        }>()

    })

    it('nested shapes', () => {

        const $todo = $({
            completed: $.boolean.mutable,
            description: $({
                content: $.string,
                deadline: $.number
            }).mutable
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

        const $optionalStringArr = $.array($.string).mutable.optional
        expectTypeOf<Infer<typeof $optionalStringArr>>()
            .toEqualTypeOf<string[] | undefined>()

        const $optionalNumArr = $.array($.number.optional)
        expectTypeOf<Infer<typeof $optionalNumArr>>()
            .toEqualTypeOf<readonly (number | undefined)[]>()

        const $todo = $({
            complete: $.boolean.mutable,
            description: $.string,
        })

        const $todoArray = $.array($todo)
        expectTypeOf<Infer<typeof $todoArray>>()
            .toEqualTypeOf<readonly { complete: boolean, readonly description: string }[]>()
    })

    it('records', () => {

        const $switches = $.record($.boolean)
        expectTypeOf<Infer<typeof $switches>>()
            .toEqualTypeOf<Readonly<Record<string, boolean>>>()

        const $scores = $.record($.number.mutable)
        expectTypeOf<Infer<typeof $scores>>()
            .toEqualTypeOf<Record<string, number>>()
    })

    it('enums', () => {
        const $trafficLight = $('red', 'green', 'yellow')
        expectTypeOf<Infer<typeof $trafficLight>>()
            .toEqualTypeOf<'red' | 'green' | 'yellow'>()
    })

    it('tuples', () => {
        const $range = $.tuple($.number, $.number)
        expectTypeOf<Infer<typeof $range>>()
            .toEqualTypeOf<readonly [number, number]>()

        const $between = $.tuple($.number, $.or($('<'), $('>')), $.number).mutable
        expectTypeOf<Infer<typeof $between>>()
            .toEqualTypeOf<[number, '<' | '>', number]>()
    })

    it('unions', () => {

        const $id = $.or($.string, $.number)
        expectTypeOf<Infer<typeof $id>>()
            .toEqualTypeOf<string | number>()
    })

    it('intersections', () => {

        const $quaternion = $.and(
            $({
                x: $.number.mutable,
                y: $.number.mutable,
                z: $.number.mutable
            }),
            $({ w: $.number.mutable.optional })
        )

        expectTypeOf<Infer<typeof $quaternion>>()
            .toEqualTypeOf<{ x: number, y: number, z: number } & { w?: number }>()
    })

})

describe('compositing', () => {

    it('shape composite type safety', () => {

        const $v2 = $({ x: $.number.mutable, y: $.number.mutable })

        const $v3 = $({ ...$v2.$, z: $.number.mutable })

        expectTypeOf<Infer<typeof $v3>>()
            .toEqualTypeOf<{ x: number, y: number, z: number }>()

    })

    it('tuple composite type safety', () => {

        const $range = $($.number, $.number)
        const $op = $('>', '==', '<')
        const $rangeWithOp = $.tuple(...$range.$, $op)

        expectTypeOf<Infer<typeof $rangeWithOp>>()
            .toEqualTypeOf<readonly [number, number, '<' | '>' | '==']>()
    })

})

describe('$.typeOf', () => {

    it('allows typeguards', () => {
        const $foo = $.typeOf(is.symbol)
       
        const symbol = Symbol()
    
        expect($foo.validate(symbol)).toEqual(symbol)
        expect(() => $foo.validate('not a symbol'))
            .toThrow('must be Symbol')
    })

})
