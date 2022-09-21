
import { AssertMethod } from './type-methods'

import { is, assert, validate, } from './schema'

import { expectTypeOf } from 'expect-type'

/*** Test Types ***/

class Foo {

}

/*** Tests ***/

describe('assertions must-be-declared workaround', () => {

    const str: unknown = ''
    const foo: unknown = new Foo()

    it('asserts chained off the assert export appear to be ok', () => {

        assert.string(str) // no assertions-must-be-declared error 
        expectTypeOf(str).toEqualTypeOf<string>()
    })

    it('asserts declared from asserts of the chain are not', () => {

        const assertString1 = assert.string
        // @ts-expect-error assertions-must-be-declared
        assertString1(str)
        expectTypeOf(str).toEqualTypeOf<unknown>()
    })

    it('asserts from built asserters are not ok', () => {

        // @ts-expect-error assertions-must-be-declared
        assert(Foo)(foo)
        expectTypeOf(foo).toEqualTypeOf<unknown>()

        const assertFoo: AssertMethod<Foo> = assert(Foo)
        assertFoo(foo)
        expectTypeOf(foo).toEqualTypeOf<Foo>()

        assert(Foo)
    })

    it('assert transitions do not have type safety', () => {

        // no assertions-must-be-declared error
        is.string.assert(str)
        expectTypeOf(str).toEqualTypeOf<unknown>()
    })

    it('explicitly declaring assertion method works', () => {

        const assertString: AssertMethod<string> = is.string.assert

        assertString(str)
        expectTypeOf(str).toEqualTypeOf<string>()
    })

})