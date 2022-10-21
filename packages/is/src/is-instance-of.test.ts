import is from './is'
import { Constructor } from './types'

describe(`is()`, () => {

    describe(`arguments`, () => {

        const isNull = (
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ...args: any
        ): boolean => is(null, ...args)

        it(`requires type arguments to be classes`, () => {
            [
                Array,
                Function,
                Object,
                String,
                Boolean,
                Number,
                class { }
            ].forEach(func => {
                expect(() => isNull(func)).not.toThrow(Error)
            });

            [{ foo: `bar` }, `oh hai`, true, -5].forEach(value => {
                expect(() => isNull(value)).toThrow(Error)
            })
        })
    })

    describe(`determine if first argument is a specific type`, () => {

        it(`is([], Object)                 == true`,
            () => expect(is([], Object)).toEqual(true))

        it(`is([], Array)                  == true`,
            () => expect(is([], Array)).toEqual(true))

        it(`is(true, Boolean)              == true`,
            () => expect(is(true, Boolean)).toEqual(true))

        it(`is(new Boolean(false), Boolean)== true`,
            () => expect(is(new Boolean(false), Boolean)).toEqual(true))

        it(`is(10, Number)                 == true`,
            () => expect(is(10, Number)).toEqual(true))

        it(`is(NaN, Number)                == true`,
            () => expect(is(NaN, Number)).toEqual(false))

        it(`is(100n, BigInt)               == true`,
            () => expect(is(100n, BigInt as unknown as Constructor<number>)).toEqual(true))

        it(`is(100, BigInt)                == true`,
            () => expect(is(100, BigInt as unknown as Constructor<number>)).toEqual(false))

        it(`is(new Number(0), Number)      == true`,
            () => expect(is(new Number(0), Number)).toEqual(true))

        it(`is("str", String)              == true`,
            () => expect(is(`str`, String)).toEqual(true))

        it(`is("str", Object)              == false`,
            () => expect(is(`str`, Object)).toEqual(false))

        it(`is(new String("str"), String)  == true`,
            () => expect(is(new String(`str`), String)).toEqual(true))

        it(`is(new String("str"), Object)  == true`,
            () => expect(is(new String(`str`), Object)).toEqual(true))

        it(`is(/expr/, RegExp)             == true`,
            () => expect(is(/expr/, RegExp)).toEqual(true))

        it(`is(/expr/, Object)             == true`,
            () => expect(is(/expr/, Object)).toEqual(true))

        it(`is(function(){}, Object)       == false`,
            () => expect(is(function () { /* empty */ }, Object)).toEqual(false))

        it(`is(function(){}, Function)     == true`,
            () => expect(is(function () { /* empty */ }, Function)).toEqual(true))

        it(`is(Array, Object)              == false`,
            () => expect(is(Array, Object)).toEqual(false))

        it(`is(Array, Function)            == true`,
            () => expect(is(Array, Function)).toEqual(true))

        it(`is(Array, Array)               == false`,
            () => expect(is(Array, Array)).toEqual(false))

        it(`is(new Date(), Date)           == true`,
            () => expect(is(new Date(), Date)).toEqual(true))

        it(`is(new Date(), Object)         == true`,
            () => expect(is(new Date(), Object)).toEqual(true))

        it(`is(Symbol(), Object)           == false`,
            () => expect(is(Symbol(`2`), Object)).toEqual(false))

        it(`is(undefined, Object)          == false`,
            () => expect(is(undefined, Object)).toEqual(false))

        it(`is(null, Object)               == false`,
            () => expect(is(null, Object)).toEqual(false))

        it(`is(Object.create(null), Object)== true`,
            () => expect(is(Object.create(null), Object)).toEqual(true))

    })

    describe(`determine if first argument is a custom type`, () => {

        class Foo { /* empty */ }
        class Bar { /* empty */ }

        it(`is(new Foo(), Foo) == true`, () => expect(is(new Foo(), Foo)).toEqual(true))
        it(`is(new Bar(), Foo) == false`, () => expect(is(new Bar(), Foo)).toEqual(false))

    })

    describe(`determine if first argument is one of multiple types`, () => {
        it(`is("str", Number, Boolean, String) == true`,
            () => expect(is(`str`, Number, Boolean, String)).toEqual(true)
        )
        it(`is({}, Number, Boolean, String)    == false`,
            () => expect(is({}, Number, Boolean, String)).toEqual(false)
        )
    })
})
