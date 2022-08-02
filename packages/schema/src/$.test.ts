import $ from './$'

import {
    StringSchema,
    BooleanSchema,
    NumberSchema,

    ShapeSchema,
    ArraySchema,
    TupleSchema,

    OrSchema,
    AndSchema
} from './schema'

/**
 * These tests might look redundant from a runtime perspective, but they 
 * exist to ensure the $ usage syntax doesn't have any type errors.
 */
describe.only('$ Syntax Tests', () => {

    // TODO move this test elsewhere
    describe('.validate', () => {

        it('Validates a value against the schema', () => {
            const CountSchema = $.number()
            expect(CountSchema.validate(1)).toBe(1)
        })

    })

    describe('Creates Schema\'s for primitive types', () => {

        it('$.string() -> string', () => {

            const NameSchema = $.string()
            expect(NameSchema).toBeInstanceOf(StringSchema)

            type Name = typeof NameSchema.output
            const name: Name = 'Ben'
            expect(NameSchema.validate(name)).toEqual(name)
        })

        it('$.string() supports template types', () => {

            const IdSchema = $.string<`#id${number}`>('#id0000')
            expect(IdSchema).toBeInstanceOf(StringSchema)

            type Id = typeof IdSchema.output
            const id: Id = '#id0001'
            expect(IdSchema.validate(id)).toEqual(id)

            // @ts-expect-error badId does not conform to string type.
            const badId: Id = 'not-an-id'
            void badId
        })

        it('$.number() supports string unions', () => {

            const SuitSchema = $.string<'hearts' | 'clubs' | 'diamonds' | 'spades'>()
            expect(SuitSchema).toBeInstanceOf(StringSchema)

            type Suit = typeof SuitSchema.output
            const suit: Suit = 'hearts'
            expect(SuitSchema.validate(suit)).toEqual(suit)

            // @ts-expect-error badSuit does not conform to string union.
            const badSuit: Suit = 'spoons'
            void badSuit
        })

        it('$.number() -> number', () => {

            const CountSchema = $.number()
            expect(CountSchema).toBeInstanceOf(NumberSchema)

            type Count = typeof CountSchema.output
            const count: Count = 100
            expect(CountSchema.validate(count)).toEqual(count)
        })

        it('$.number() supports number unions', () => {

            const SortSchema = $.number<1 | 0 | -1>()
            expect(SortSchema).toBeInstanceOf(NumberSchema)

            type Sort = typeof SortSchema.output
            const sort: Sort = 0
            expect(SortSchema.validate(sort)).toEqual(sort)

            // @ts-expect-error badSort does not conform to string union.
            const badSort: Sort = 2
            void badSort
        })

        it('$.boolean() -> boolean', () => {

            const FlagSchema = $.boolean()
            expect(FlagSchema).toBeInstanceOf(BooleanSchema)

            type Flag = typeof FlagSchema.output

            const flag: Flag = true
            expect(FlagSchema.validate(flag)).toEqual(flag)
        })

        it('$.boolean() supports const booleans', () => {
            const TrueSchema = $.boolean<true>()
            expect(TrueSchema).toBeInstanceOf(BooleanSchema)

            type True = typeof TrueSchema.output
            const _true: True = true

            expect(TrueSchema.validate(_true)).toEqual(_true)

            // @ts-expect-error _false is not true
            const _false: True = false
            void _false

        })
    })

    describe('Creates schemas for array types', () => {

        it('$.array() -> Array<T>', () => {
            const BufferSchema = $.array($.number())
            expect(BufferSchema).toBeInstanceOf(ArraySchema)

            type Buffer = typeof BufferSchema.output
            const buffer: Buffer = [0, 1, 2, 3, 4]
            expect(BufferSchema.validate(buffer)).toEqual(buffer)
        })

        it('Nested shape shorthand $.array({})', () => {

            const TodoListSchema = $.array({
                completed: $.boolean(),
                date: $.number(),
                content: $.string()
            })
            expect(TodoListSchema).toBeInstanceOf(ArraySchema)

            type TodoList = typeof TodoListSchema.output
            const todoList: TodoList = [{
                completed: false,
                date: Date.now(),
                content: 'Finish writing tests'
            }]
            expect(TodoListSchema.validate(todoList)).toEqual(todoList)
        })
    })

    describe('Creates schemas for object types', () => {

        it('$.shape() -> {}', () => {

            const Vector2Schema = $.shape({
                x: $.number(),
                y: $.number()
            })
            expect(Vector2Schema).toBeInstanceOf(ShapeSchema)

            type Vector2 = typeof Vector2Schema.output
            const vector2: Vector2 = { x: 0, y: 0 }

            expect(Vector2Schema.validate(vector2)).toEqual(vector2)
        })

        it('$({}) -> {} shorthand', () => {

            const Vector3Schema = $({
                x: $.number(),
                y: $.number(),
                z: $.number()
            })
            expect(Vector3Schema).toBeInstanceOf(ShapeSchema)

            type Vector3 = typeof Vector3Schema.output
            const vector3: Vector3 = { x: 0, y: 0, z: 0 }

            expect(Vector3Schema.validate(vector3)).toEqual(vector3)
        })

        it('Nested shape shorthand $({foo: {}})', () => {

            const EmployeeSchema = $.shape({
                name: $.string(),
                id: $.number(),
                role: $.string(),

                salary: {
                    $: $.number(),
                    per: $.string()
                }
            })
            expect(EmployeeSchema).toBeInstanceOf(ShapeSchema)

            type Employee = typeof EmployeeSchema.output
            const employee: Employee = {
                name: 'Ben',
                id: 0,
                role: 'Magistrate',
                salary: {
                    $: 1000000,
                    per: 'minute'
                }
            }
            expect(EmployeeSchema.validate(employee)).toEqual(employee)
        })
    })

    describe('Creates schemas for tuple types', () => {
        it('$.tuple()', () => {
            const RangeSchema = $.tuple($.number(), $.number())
            expect(RangeSchema).toBeInstanceOf(TupleSchema)

            type Range = typeof RangeSchema.output
            const range: Range = [0, 10]

            expect(RangeSchema.validate(range)).toEqual(range)
        })

        it('$.tuple({}, {}) works with nested shapes', () => {

            const V2Schema = $({
                x: $.number(),
                y: $.number()
            })

            const EdgeSchema = $.tuple(V2Schema, V2Schema)
            expect(EdgeSchema).toBeInstanceOf(TupleSchema)

            type Edge = typeof EdgeSchema.output
            const edge: Edge = [{ x: 0, y: 0 }, { x: 5, y: 5 }]

            expect(EdgeSchema.validate(edge)).toEqual(edge)
        })
    })

    describe('Creates schemas for or types', () => {

        it('$.or()', () => {

            const KeySchema = $.or($.string(), $.number())
            expect(KeySchema).toBeInstanceOf(OrSchema)

            type Key = typeof KeySchema.output
            const key1: Key = 'string'
            const key2: Key = 100

            expect(KeySchema.validate(key1)).toEqual(key1)
            expect(KeySchema.validate(key2)).toEqual(key2)
        })
    })

    describe('Creates schemas for and types', () => {

        it('$.and()', () => {
            const V3Schema = $.and({
                x: $.number(),
                y: $.number()
            }, {
                z: $.number()
            })
            expect(V3Schema).toBeInstanceOf(AndSchema)

            type V3 = typeof V3Schema.output

            const v3: V3 = { x: 0, y: 1, z: 2 }
            expect(V3Schema.validate(v3)).toEqual(v3)
        })
    })
})
