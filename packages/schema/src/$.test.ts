import {
    $,

    TupleSchema,
    BooleanSchema,
    NumberSchema,
    ShapeSchema,
    StringSchema,
    OrSchema

} from './$'

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

    /*
    describe('Creates schemas for array types', () => {

        it('$.array() -> Array<T>', () => {
            const BufferSchema = $.array($.number())
            expect(BufferSchema).toBeInstanceOf(TupleSchema)

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
            expect(TodoListSchema).toBeInstanceOf(TupleSchema)

            type TodoList = typeof TodoListSchema.output
            const todoList: TodoList = [{
                completed: false,
                date: Date.now(),
                content: 'Finish writing tests'
            }]
            expect(TodoListSchema.validate(todoList)).toEqual(todoList)
        })

        it('Nested array in shape shorthand: $.array({ arr: []})', () => {

            const ArmySchema = $.array({
                battalion: $.string<`${number} ${string} Division`>(),
                soldiers: [{
                    name: $.string(),
                    rank: $.string()
                }]
            })
            expect(ArmySchema).toBeInstanceOf(TupleSchema)

            type Army = typeof ArmySchema.output
            const army: Army = [{
                battalion: '101 Danger Division',
                soldiers: [
                    { name: 'Steve', rank: 'Sarge' },
                    { name: 'Tony', rank: 'Tech' }
                ]
            }]

            expect(ArmySchema.validate(army)).toEqual(army)
        })
    })
    */

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

        it('Nested array shortahnd: $({foo: []})', () => {

            const RobotSchema = $({
                function: $.string(),
                tasks: [$.string()]
            })
            expect(RobotSchema).toBeInstanceOf(ShapeSchema)

            type Robot = typeof RobotSchema.output
            const robot: Robot = {
                function: 'Human Killer',
                tasks: ['kill human#1', 'kill human#2']
            }
            expect(RobotSchema.validate(robot)).toEqual(robot)
        })

        it('Nested array shape shorthand: $({foo: [{}]})', () => {

            const ConcertTourSchema = $({
                start: $.number(),
                end: $.number(),
                tour: [{
                    city: $.string(),
                    venue: $.string(),
                    dates: [$.number()] as const
                }]
            })
            expect(ConcertTourSchema).toBeInstanceOf(ShapeSchema)

            type ConcertTour = typeof ConcertTourSchema.output
            const concertTour: ConcertTour = {

                start: Date.now(),
                end: Date.now(), // ooof short tour

                // two concerts in the same millisecond in two cities. Damn.
                tour: [{
                    city: 'Vancouver',
                    venue: 'BC Place',
                    dates: [Date.now()]
                }, {
                    city: 'Seattle',
                    venue: 'The Seattle... pirate dome or whatever',
                    dates: [Date.now()]
                }]

            }
            expect(ConcertTourSchema.validate(concertTour)).toEqual(concertTour)
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

        it('$.or({},[]) shape/array shorthand', () => {

            const ColorSchema = $.or(
                [$.number(), $.number(), $.number(), $.number()] as const,
                { hsv: [$.number()] },
                { hex: $.string<`#${string}`>() }
            )

            type Color = typeof ColorSchema.output
            const color1: Color = [255, 255, 255, 1]
            const color2: Color = { hsv: [360, 1, 1] }
            const color3: Color = { hex: '#fff' }

            expect(ColorSchema.validate(color1)).toEqual(color1)
            expect(ColorSchema.validate(color2)).toEqual(color2)
            expect(ColorSchema.validate(color3)).toEqual(color3)

        })
    })
})
