import isPlainObject from './is-plain-object'

/* globals describe it */

describe(`isPlainObject()`, () => {

    describe(`determine if a value is a plain object`, () => {

        it(`isPlainObject(['str'])                 == false`,
            () => expect(isPlainObject([`str`])).toEqual(false)
        )

        it(`isPlainObject(new Date())              == false`,
            () => expect(isPlainObject(new Date())).toEqual(false)
        )

        it(`isPlainObject({})                      == true`,
            () => expect(isPlainObject({})).toEqual(true)
        )

        it(`isPlainObject(new Object())            == true`,
            () => expect(isPlainObject(Object({}))).toEqual(true)
        )

        it(`isPlainObject(new function FooBar(){}) == false`,
            () => expect(isPlainObject(new class FooBar { /* blank */ }())).toEqual(false)
        )

        it(`isPlainObject(Object.create(null))     == true`,
            () => expect(isPlainObject(Object.create(null))).toEqual(true)
        )

    })
})
